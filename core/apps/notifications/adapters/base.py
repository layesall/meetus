from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Tuple


class BaseEmailAdapter(ABC):
    """Interface abstraite pour tous les adaptateurs d'envoi d'e-mails."""

    @abstractmethod
    def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        to_name: Optional[str] = None,
    ) -> bool:
        """
        Rend un template et envoie l'e-mail.
        Returns: True si envoyé avec succès, False sinon.
        """
        pass


class BaseCalendarAdapter(ABC):
    """Interface abstraite pour les adaptateurs de gestion d'événements calendrier."""

    @abstractmethod
    def create_event(
        self,
        summary: str,
        description: str,
        start_time,
        end_time,
        client_email: str,
    ) -> Tuple[Optional[str], Optional[str]]:
        """Crée un événement et retourne une tuple (event_id, meet_link)."""
        pass

    @abstractmethod
    def delete_event(self, event_id: str) -> bool:
        """Supprime un événement à partir de son identifiant."""
        pass