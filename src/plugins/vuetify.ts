import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'issuesTrackerTheme',
    themes: {
      issuesTrackerTheme: {
        dark: false,
        colors: {
          primary: '#0D9488',
          secondary: '#0F172A',
          background: '#F1F5F9',
          surface: '#0f1419',
        },
      },
    },
  },
})
