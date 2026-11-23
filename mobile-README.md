# St. Michel School - Mobile Applications

We have transitioned the frontend to Native Mobile Apps using React Native (Expo).

## 1. Parent & Student App (`parent-student-mobile`)
- **Login**: Secure login with JWT.
- **Dashboard**: Student overview, fees summary, attendance.
- **Fees**: View bills and pay online.
- **Notices**: Real-time school announcements.

## 2. School Manager App (`school-manager-mobile`)
- **Admin Dashboard**: Real-time stats (Revenue, Admissions, Stock).
- **Management**: Student directory, fee collection, inventory control.

## How to Run:

1. **Backend**:
   ```bash
   cd school-backend
   npm start
   ```

2. **Mobile Apps**:
   Install Expo Go on your physical phone (Android/iOS).
   
   For Parent App:
   ```bash
   cd parent-student-mobile
   npm install
   npx expo start
   ```
   Scan the QR code with your phone.

   For Manager App:
   ```bash
   cd school-manager-mobile
   npm install
   npx expo start
   ```
   Scan the QR code with your phone.

## Dependencies:
- React Native
- Expo
- NativeWind (Tailwind)
- React Navigation
- Axios
- Lucide Icons
