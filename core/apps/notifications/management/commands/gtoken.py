import os
from django.core.management.base import BaseCommand
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/calendar']

class Command(BaseCommand):
    help = 'Génère ou rafraîchit le fichier token.json Google OAuth2 pour l’application.'

    def handle(self, *args, **options):
        credentials_path = 'credentials.json'
        token_path = 'token.json'

        if not os.path.exists(credentials_path):
            self.stderr.write(self.style.ERROR(
                f"Le fichier '{credentials_path}' est introuvable. Veuillez le placer à la racine de votre projet."
            ))
            return

        self.stdout.write("Ouverture du navigateur pour l'authentification Google OAuth2...")
        
        try:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)

            with open(token_path, 'w') as token_file:
                token_file.write(creds.to_json())

            self.stdout.write(self.style.SUCCESS(
                f"Succès ! Le fichier '{token_path}' a été généré avec succès."
            ))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Erreur lors de la génération du token: {e}"))