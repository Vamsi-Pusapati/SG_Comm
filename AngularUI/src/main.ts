import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const lag_duration = 400; // ms
const max_opacity = '0.4';

const blob = document.getElementById('blob');
if(!blob){
  throw new Error('No blob element found');
}

document.onpointerout = () => {
  blob.style.opacity = '0';
}

document.onpointerenter = () => {
  blob.style.opacity = max_opacity;
}

document.onpointermove = (event) => {
  blob.style.opacity = max_opacity;
  const {clientX, clientY} = event;
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`,
  }, {duration: lag_duration, fill: 'forwards'});
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
