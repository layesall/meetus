# Meetus

**Meetus** is a streamlined, self-hosted scheduling platform designed to handle professional appointments by displaying real-time host availability. Built as an open and flexible alternative to services like Calendly, it integrates seamlessly into external sites (WordPress, Shopify, custom web apps, etc.).

---

## 🚀 Key Features

* **Real-Time Calendar Sync:** Automated synchronization with Google Calendar API to fetch availability and handle instant event creation.
* **Automated Booking & Cancellation:**
  * Secure, token-based cancellation mechanism (`CancelBookingView`).
  * Strict business rule enforcement (e.g., 24-hour cancellation deadline).
  * Automatic removal of cancelled events from Google Calendar.
* **Multi-Recipient Email Notifications:**
  * Automated email dispatch powered by Brevo REST API.
  * Local, responsive HTML templates stored within the repository for full portability.
  * Instant confirmation and cancellation alerts for both the client and the host/admin.
* **Modern Administration Dashboard:** Integrated with Django Unfold for an intuitive management experience.
* **Embed Ready:** Designed to be embedded smoothly into third-party platforms (WordPress, Shopify, static sites).

---

## 🛠️ Tech Stack

* **Backend Framework:** Django 5.x
* **API Layer:** Django Ninja
* **Database:** PostgreSQL / SQLite (Development)
* **Email Service:** Brevo REST API (via `sib-api-v3-sdk`)
* **Calendar Integration:** Google Calendar API
* **Environment Configuration:** `python-decouple`

---

## 📋 Prerequisites

* Python 3.11+
* Brevo API Key & Verified Sender Email
* Google Cloud Console Credentials (with Google Calendar API enabled)

---

## ⚙️ Environment Setup

Create a `.env` file in the project root directory with the following variables:

```env
# Django Configuration
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
SITE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

# Brevo & Email Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender@domain.com
BREVO_SENDER_NAME=MeetUs
ADMIN_NOTIFICATION_EMAIL=admin@domain.com

# Google Calendar Configuration
GOOGLE_CALENDAR_ID=primary

```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone [https://github.com/your-username/meetus.git](https://github.com/your-username/meetus.git)
cd meetus

```

### 2. Set up a Virtual Environment

```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

```

### 3. Install Dependencies

```bash
pip install -r requirements.txt

```

### 4. Run Database Migrations

```bash
python manage.py migrate

```

### 5. Create a Superuser (Admin Dashboard Access)

```bash
python manage.py createsuperuser

```

### 6. Start the Development Server

```bash
python manage.py runserver

```

Access the application API docs at `http://127.0.0.1:8000/api/v1/docs` and the Admin panel at `http://127.0.0.1:8000/admin/`.

---

## 📧 Email Templates Architecture

Transactional emails use local Django templates located in:
`apps/bookings/templates/bookings/emails/`

* `client_confirmation.html`: Sent to the client upon booking. Includes Google Meet link and cancellation URL.
* `admin_confirmation.html`: Alert sent to host/admin on new bookings.
* `client_cancellation.html`: Confirmation sent to the client when a booking is cancelled.
* `admin_cancellation.html`: Alert sent to host/admin when a client cancels.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.