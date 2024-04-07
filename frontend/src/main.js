import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import PrimeVue from "primevue/config";
import { createPinia } from "pinia";
import DialogService from "primevue/dialogservice";
import LoadScript from 'vue-plugin-load-script';
import ToastService from "primevue/toastservice";


//in main.js
import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import "primevue/resources/primevue.min.css"
import "primevue/resources/primevue.css"

import 'v-calendar/style.css';
import VCalendar from 'v-calendar';

const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(PrimeVue);
app.use(VCalendar, {});
app.use(pinia);
app.use(DialogService);
app.use(LoadScript);
app.use(ToastService);
app.mount('#app')

