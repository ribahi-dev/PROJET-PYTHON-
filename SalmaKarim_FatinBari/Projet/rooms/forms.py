from django import forms

from .models import Room


class RoomForm(forms.ModelForm):
    class Meta:
        model = Room
        fields = [
            'building',
            'floor',
            'code',
            'name',
            'room_type',
            'capacity',
            'location',
            'description',
            'equipment',
            'is_active',
        ]
        widgets = {
            'building': forms.TextInput(attrs={'class': 'form-control'}),
            'floor': forms.NumberInput(attrs={'class': 'form-control', 'min': 0}),
            'code': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'room_type': forms.Select(attrs={'class': 'form-select'}),
            'capacity': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
            'location': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'equipment': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Ex: projecteur, wifi, tableau'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
