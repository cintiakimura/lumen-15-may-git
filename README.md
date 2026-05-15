**Welcome to your Lumen project** 

**About**

View and Edit  your app on [Lumen.com](http://Lumen.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Lumen Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_LUMEN_APP_ID=your_app_id
VITE_LUMEN_APP_BASE_URL=your_backend_url

e.g.
VITE_LUMEN_APP_ID=cbef744a8545c389ef439ea6
VITE_LUMEN_APP_BASE_URL=https://my-to-do-list-81bfaad7.lumen.app
```

Run the app: `npm run dev`

**Environment variables:** Prefer `VITE_LUMEN_*`. The Vite plugin from the platform SDK still looks for `VITE_BASE44_*` in a few places; `vite.config.js` mirrors your Lumen-prefixed values when the legacy names are missing, and `app-params.js` accepts either prefix.

**Publish your changes**

Open [Lumen.com](http://Lumen.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.lumen.com/Integrations/Using-GitHub](https://docs.lumen.com/Integrations/Using-GitHub)

Support: [https://app.lumen.com/support](https://app.lumen.com/support)
