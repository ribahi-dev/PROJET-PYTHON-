from sris.demo_seed import seed_demo_data


result = seed_demo_data()

print('Base de demonstration initialisee avec succes.')
print(f"Nombre de salles chargees: {result['rooms_count']}")
print('Comptes:')
for account in result['accounts']:
    print(f'  - {account}')
