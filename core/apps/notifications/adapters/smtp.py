import logging
from typing import Any, Dict, Optional
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from apps.notifications.adapters.base import BaseEmailAdapter

logger = logging.getLogger(__name__)


class SmtpEmailAdapter(BaseEmailAdapter):
    """Adaptateur utilisant le système d'e-mail natif de Django (SMTP/Console)."""

    def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        to_name: Optional[str] = None,
    ) -> bool:
        try:
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@meetus.com")
            
            # Rendu du template HTML
            html_content = render_to_string(template_name, context)

            email = EmailMultiAlternatives(
                subject=subject,
                body="",  # Version texte optionnelle
                from_email=from_email,
                to=[to_email],
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            return True
        except Exception as e:
            logger.error(f"[SMTP Error] Échec de l'envoi de l'e-mail à {to_email}: {e}")
            return False