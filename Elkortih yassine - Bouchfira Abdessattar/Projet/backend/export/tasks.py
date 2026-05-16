import csv
import json
from io import StringIO, BytesIO
from celery import shared_task
from django.core.files.base import ContentFile
from django.conf import settings
from ideas.models import Idea
from feedbacks.models import Feedback
from comments.models import Comment


@shared_task
def export_idea_csv(idea_id):
    """
    Génère un export CSV d'une idée avec tous ses feedbacks.
    Retourne le chemin du fichier généré.
    """
    try:
        idea = Idea.objects.select_related('owner').get(id=idea_id)
        feedbacks = Feedback.objects.filter(idea=idea).select_related('reviewer', 'reviewer__userprofile')
        
        # Créer le CSV en mémoire
        output = StringIO()
        writer = csv.writer(output)
        
        # En-têtes
        writer.writerow(['=== INFORMATIONS IDÉE ==='])
        writer.writerow(['Titre', idea.title])
        writer.writerow(['Propriétaire', idea.owner.username])
        writer.writerow(['Secteur', idea.sector])
        writer.writerow(['Statut', idea.status])
        writer.writerow(['Description', idea.description])
        writer.writerow(['Problème', idea.problem])
        writer.writerow(['Solution', idea.solution])
        writer.writerow(['Cible', idea.target])
        writer.writerow(['Score Global', idea.global_score])
        writer.writerow([])
        
        # Feedbacks
        writer.writerow(['=== FEEDBACKS ==='])
        writer.writerow(['Reviewer', 'Niveau', 'Marché', 'Innovation', 'Faisabilité', 'ROI', 'Score Pondéré', 'Commentaire', 'Date'])
        
        for f in feedbacks:
            level = getattr(f.reviewer.userprofile, 'level', 'Bronze') if hasattr(f.reviewer, 'userprofile') else 'Bronze'
            writer.writerow([
                f.reviewer.username,
                level,
                f.market_score,
                f.innovation_score,
                f.feasibility_score,
                f.roi_score,
                round(f.weighted_score, 2),
                f.comment,
                f.created_at.strftime('%Y-%m-%d %H:%M')
            ])
        
        # Sauvegarder le fichier
        filename = f'export_idea_{idea_id}.csv'
        filepath = f'{settings.MEDIA_ROOT}/exports/{filename}'
        
        import os
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8-sig', newline='') as f:
            f.write(output.getvalue())
        
        return {'success': True, 'filepath': filepath, 'filename': filename}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}


@shared_task
def export_idea_json(idea_id):
    """
    Génère un export JSON d'une idée avec tous ses feedbacks et commentaires.
    Retourne le chemin du fichier généré.
    """
    try:
        idea = Idea.objects.select_related('owner').get(id=idea_id)
        feedbacks = Feedback.objects.filter(idea=idea).select_related('reviewer', 'reviewer__userprofile')
        comments = Comment.objects.filter(idea=idea, is_deleted=False).select_related('author')
        
        # Construire le JSON
        data = {
            'idea': {
                'id': str(idea.id),
                'title': idea.title,
                'owner': idea.owner.username,
                'sector': idea.sector,
                'status': idea.status,
                'description': idea.description,
                'problem': idea.problem,
                'solution': idea.solution,
                'target': idea.target,
                'global_score': idea.global_score,
                'created_at': idea.created_at.isoformat(),
            },
            'feedbacks': [
                {
                    'id': str(f.id),
                    'reviewer': f.reviewer.username,
                    'reviewer_level': getattr(f.reviewer.userprofile, 'level', 'Bronze') if hasattr(f.reviewer, 'userprofile') else 'Bronze',
                    'market_score': f.market_score,
                    'innovation_score': f.innovation_score,
                    'feasibility_score': f.feasibility_score,
                    'roi_score': f.roi_score,
                    'raw_score': f.raw_score,
                    'weighted_score': round(f.weighted_score, 2),
                    'comment': f.comment,
                    'created_at': f.created_at.isoformat(),
                }
                for f in feedbacks
            ],
            'comments': [
                {
                    'id': str(c.id),
                    'author': c.author.username,
                    'content': c.content,
                    'created_at': c.created_at.isoformat(),
                }
                for c in comments
            ],
            'statistics': {
                'total_feedbacks': feedbacks.count(),
                'total_comments': comments.count(),
                'avg_sgv': round(sum(f.weighted_score for f in feedbacks) / feedbacks.count(), 2) if feedbacks.exists() else 0,
            }
        }
        
        # Sauvegarder le fichier
        filename = f'export_idea_{idea_id}.json'
        filepath = f'{settings.MEDIA_ROOT}/exports/{filename}'
        
        import os
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return {'success': True, 'filepath': filepath, 'filename': filename}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}


@shared_task
def export_idea_pdf(idea_id):
    """
    Génère un export PDF d'une idée avec tous ses feedbacks.
    Utilise WeasyPrint pour la génération PDF.
    Retourne le chemin du fichier généré.
    """
    try:
        idea = Idea.objects.select_related('owner').get(id=idea_id)
        feedbacks = Feedback.objects.filter(idea=idea).select_related('reviewer', 'reviewer__userprofile')
        
        # Construire le HTML
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
                h2 {{ color: #34495e; margin-top: 30px; }}
                .info {{ background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                .feedback {{ border: 1px solid #bdc3c7; padding: 15px; margin: 15px 0; border-radius: 5px; }}
                .score {{ font-weight: bold; color: #27ae60; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th, td {{ border: 1px solid #bdc3c7; padding: 10px; text-align: left; }}
                th {{ background: #3498db; color: white; }}
            </style>
        </head>
        <body>
            <h1>📊 Export Idée : {idea.title}</h1>
            
            <div class="info">
                <p><strong>Propriétaire :</strong> {idea.owner.username}</p>
                <p><strong>Secteur :</strong> {idea.sector}</p>
                <p><strong>Statut :</strong> {idea.status}</p>
                <p><strong>Score Global :</strong> <span class="score">{idea.global_score}</span></p>
            </div>
            
            <h2>📝 Description</h2>
            <p>{idea.description}</p>
            
            <h2>❓ Problème</h2>
            <p>{idea.problem}</p>
            
            <h2>💡 Solution</h2>
            <p>{idea.solution}</p>
            
            <h2>🎯 Cible</h2>
            <p>{idea.target}</p>
            
            <h2>📊 Feedbacks ({feedbacks.count()})</h2>
        """
        
        for f in feedbacks:
            level = getattr(f.reviewer.userprofile, 'level', 'Bronze') if hasattr(f.reviewer, 'userprofile') else 'Bronze'
            html_content += f"""
            <div class="feedback">
                <p><strong>Reviewer :</strong> {f.reviewer.username} ({level})</p>
                <table>
                    <tr>
                        <th>Marché</th>
                        <th>Innovation</th>
                        <th>Faisabilité</th>
                        <th>ROI</th>
                        <th>Score Pondéré</th>
                    </tr>
                    <tr>
                        <td>{f.market_score}/25</td>
                        <td>{f.innovation_score}/25</td>
                        <td>{f.feasibility_score}/25</td>
                        <td>{f.roi_score}/25</td>
                        <td class="score">{round(f.weighted_score, 2)}</td>
                    </tr>
                </table>
                <p><strong>Commentaire :</strong> {f.comment}</p>
                <p><em>Date : {f.created_at.strftime('%Y-%m-%d %H:%M')}</em></p>
            </div>
            """
        
        html_content += """
        </body>
        </html>
        """
        
        # Générer le PDF avec WeasyPrint
        try:
            from weasyprint import HTML
            
            filename = f'export_idea_{idea_id}.pdf'
            filepath = f'{settings.MEDIA_ROOT}/exports/{filename}'
            
            import os
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            HTML(string=html_content).write_pdf(filepath)
            
            return {'success': True, 'filepath': filepath, 'filename': filename}
        
        except ImportError:
            # Si WeasyPrint n'est pas installé, retourner une erreur
            return {'success': False, 'error': 'WeasyPrint non installé. Installez-le avec : pip install weasyprint'}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}
