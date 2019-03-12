import { Route } from '@angular/router';

import { UserRouteAccessService } from 'app/core';
import { PaypalPaymentsComponent } from './paypal-payments.component';

export const PAYPAL_PAYMENTS_ROUTE: Route = {
  path: 'paypal-payments',
  component: PaypalPaymentsComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'paypal-payments.title'
  },
  canActivate: [UserRouteAccessService]
};
