import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { IPaypalCompletedPayments } from 'app/shared/model/paypal-completed-payments.model';
import { PaypalCompletedPayments } from 'app/shared/model/paypal-completed-payments.model';
import { PaypalCompletedPaymentsService } from 'app/entities/paypal-completed-payments/paypal-completed-payments.service';
import { AccountService } from 'app/core/auth/account.service';
import { IUser, UserService } from 'app/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';

declare let paypal: any;

@Component({
    selector: 'jhi-paypal-payments',
    templateUrl: './paypal-payments.component.html',
    styleUrls: [
        'paypal-payments.component.css'
    ]
})
export class PaypalPaymentsComponent implements OnInit, AfterViewChecked {
paypalPayment: IPaypalCompletedPayments = new PaypalCompletedPayments(null, moment(), '', '', 1, '', '', '');

    message: string;
    isSaving: boolean;
    addScript = false;
    paypalLoad = true;

    constructor(
        protected paypalCompletedPaymentsService: PaypalCompletedPaymentsService,
        protected accountService: AccountService
    ) {
        this.message = 'PaypalPaymentsComponent message';
    }

    ngOnInit() {
    }

    ngAfterViewChecked() {
        if (!this.addScript) {
            this.addPaypalScript().then(() => {
                const _this = this;
                paypal.Buttons({
                    createOrder(data, actions) {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: '0.10'
                                }
                            }]
                        });
                    },
                    onApprove(data, actions) {
                        // Capture the funds from the transaction
                        actions.order.capture().then(function(details) {
                            // Show a success message to your buyer
                            alert('Transaction completed by ' + details.payer.name.given_name);
                            _this.isSaving = true;
                            _this.paypalPayment.date = moment();
                            _this.paypalPayment.idPayment = details.id;
                            _this.paypalPayment.currency = details.purchase_units[0].amount.currency_code;
                            _this.paypalPayment.amount = details.purchase_units[0].amount.value;
                            _this.paypalPayment.email = details.payer.email_address;
                            _this.paypalPayment.name = details.purchase_units[0].shipping.name.full_name;
                            _this.paypalPayment.status = details.status;
                            _this.accountService.fetch()
                                .toPromise()
                                .then(response => {
                                    const account = response.body;
                                    if (account) {
                                        _this.paypalPayment.user = account;
                                    }
                                    _this.subscribeToSaveResponse(_this.paypalCompletedPaymentsService.create(_this.paypalPayment));
                                });
                        });
                    }
                }).render('#paypal-checkout-btn');
                this.paypalLoad = false;
            });
        }
    }

    addPaypalScript() {
        this.addScript = true;
        return new Promise((resolve, reject) => {
            const scripttagElement = document.createElement('script');
            scripttagElement.src = 'https://www.paypal.com/sdk/js?client-id=REPLACE_WITH_PAYPAL_CLIENT_ID';
            // last paypal script (before february 2019)
            // scripttagElement.src = 'https://www.paypalobjects.com/api/checkout.js';
            scripttagElement.onload = resolve;
            document.body.appendChild(scripttagElement);
        });
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IPaypalCompletedPayments>>) {
        result.subscribe(
            (res: HttpResponse<IPaypalCompletedPayments>) => this.onSaveSuccess(),
            (res: HttpErrorResponse) => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        console.log('Payment success with entity creation.');
    }

    protected onSaveError() {
        this.isSaving = false;
        console.log('Fail to create payment entity.');
    }

}
