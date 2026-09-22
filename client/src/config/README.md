# ⚙️ Site Configuration Guide

This folder contains high-level website configuration settings: website name, navigation links, contact info, and support channels.

---

## 📂 Quick Config Map

| File | What you can edit in this file |
| :--- | :--- |
| **[`siteConfig.ts`](./siteConfig.ts)** | Website title (`IndoorNav`), slogan/tagline, support email, phone number (`+91 8838545775`), office address, and default credentials. |
| **[`navigation.ts`](./navigation.ts)** | Header navigation bar links (Home, Explore, Locations, About, Help), footer links, and action buttons. |

---

## 💡 Example: Changing Website Name or Phone Number
Open [`siteConfig.ts`](./siteConfig.ts):
```ts
export const siteConfig = {
  name: 'IndoorNav',              // Change website title here
  tagline: 'Find Your Way Inside.',
  contact: {
    email: 'support@indoornav.com',
    phone: '+91 8838545775',      // Update phone number here
    address: 'Campus Building A, Room 101'
  },
  // ...
};
```
Save the file, and your changes will apply instantly across the entire website!
