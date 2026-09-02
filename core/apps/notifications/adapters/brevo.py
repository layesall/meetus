# apps/notifications/adapters/brevo.py

import logging
from typing import Any, Dict, Optional
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
from django.template.loader import render_to_string
from apps.notifications.adapters.base import BaseEmailAdapter

logger = logging.getLogger(__name__)


class BrevoEmailAdapter(BaseEmailAdapter):
    """Adaptateur d'envoi utilisant le SDK officiel Brevo (sib_api_v3_sdk)."""

    def _get_api_instance(self):
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key["api-key"] = getattr(settings, "BREVO_API_KEY", "")
        return sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        to_name: Optional[str] = None,
    ) -> bool:
        try:
            html_content = render_to_string(template_name, context)
            api_instance = self._get_api_instance()

            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                sender={
                    "name": getattr(settings, "BREVO_SENDER_NAME", "MeetUs"),
                    "email": getattr(settings, "BREVO_SENDER_EMAIL", getattr(settings, "DEFAULT_FROM_EMAIL", "")),
                },
                to=[{"email": to_email, "name": to_name or to_email}],
                subject=subject,
                html_content=html_content,
            )

            api_instance.send_transac_email(send_smtp_email)
            return True

        except ApiException as e:
            logger.error(f"[Brevo SDK Error] Échec d'envoi à {to_email} : {e}")
            return False
        except Exception as e:
            logger.error(f"[Email Render/Send Error] Échec pour {template_name} : {e}")
            return False