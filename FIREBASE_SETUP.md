# Firebase Setup Guide for Creovate AI

Creovate AI comes with a built-in **Demo Mode** out of the box that simulates authentication, creator rosters, campaigns, invitations, and localStorage persistence without requiring any cloud setup.

To switch from Demo Mode to live Firebase production services, follow the instructions below.

---

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `creovate-ai` (or your preferred name).
3. Disable or enable Google Analytics (optional).
4. Click **Create project**.

---

## 2. Register Web App
1. Inside your Firebase project overview, click the **Web icon (`</>`)** to add a web application.
2. Enter an app nickname, e.g., `Creovate AI Web`.
3. Click **Register app**.
4. Firebase will display your SDK configuration object (`apiKey`, `authDomain`, `projectId`, etc.).

---

## 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=creovate-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=creovate-ai
VITE_FIREBASE_STORAGE_BUCKET=creovate-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 4. Enable Firebase Authentication
1. In the Firebase console sidebar, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable:
   - **Email/Password**

---

## 5. Enable Cloud Firestore
1. Navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g., `asia-south1` for Mumbai, India).
4. Start in **Production mode**.
5. Deploy the provided security rules from `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 6. Enable Cloud Storage (for Portfolios)
1. Navigate to **Build > Storage**.
2. Click **Get Started**.
3. Accept standard storage security settings and location.

---

## 7. Restart Vite Dev Server
```bash
npm run dev
```

Creovate AI will detect your `VITE_FIREBASE_API_KEY` and automatically switch from Demo Mode to Live Firebase Mode.
