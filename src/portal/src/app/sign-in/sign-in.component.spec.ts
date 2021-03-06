import { async, ComponentFixture, getTestBed, inject, TestBed } from '@angular/core/testing';
import { SignInComponent } from './sign-in.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConfigService } from '../services/app-config.service';
import { SessionService } from '../shared/session.service';
import { CookieService } from 'ngx-cookie';
import { SkinableConfig } from "../services/skinable-config.service";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ClarityModule } from "@clr/angular";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from "rxjs";
import { throwError as observableThrowError } from 'rxjs/internal/observable/throwError';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SignInComponent', () => {
    let component: SignInComponent;
    let fixture: ComponentFixture<SignInComponent>;
    const mockedSessionService = {
        signIn() {
            return of(true);
        }
    };
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                RouterTestingModule,
                ClarityModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule
            ],
            declarations: [SignInComponent],
            providers: [
                TranslateService,
                { provide: SessionService, useValue: mockedSessionService},
                {
                    provide: AppConfigService, useValue: {
                        load: function () {
                            return of({

                            });
                        }
                    }
                },
                {
                    provide: CookieService, useValue: {
                        get: function (key) {
                            return key;
                        }
                    }
                },
                {
                    provide: SkinableConfig, useValue: {
                        getSkinConfig: function () {
                            return {
                                loginBgImg: "abc",
                                appTitle: "Harbor"
                            };
                        }
                    }
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SignInComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show core service is not available', async () => {
        expect(component).toBeTruthy();
        const sessionService =  TestBed.get<SessionService>(SessionService);
        const spy: jasmine.Spy = spyOn(sessionService, "signIn").and.returnValue(observableThrowError( new HttpErrorResponse({
            error: 'test 501 error',
            status: 501
        })));
        signIn();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(spy.calls.count()).toEqual(1);
        const errorSpan: HTMLSpanElement = fixture.nativeElement.querySelector(".error>span");
        expect(errorSpan.innerText).toEqual('SIGN_IN.CORE_SERVICE_NOT_AVAILABLE');
    });
    it('should show invalid username or password', async () => {
        expect(component).toBeTruthy();
        const sessionService = TestBed.get<SessionService>(SessionService);
        const spy: jasmine.Spy = spyOn(sessionService, "signIn").and.returnValue(observableThrowError( new HttpErrorResponse({
            error: 'test 404 error',
            status: 404,
            statusText: 'Not Found'
        })));
        signIn();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(spy.calls.count()).toEqual(1);
        const errorSpan: HTMLSpanElement = fixture.nativeElement.querySelector(".error>span");
        expect(errorSpan.innerText).toEqual('SIGN_IN.INVALID_MSG');
    });
    function signIn() {
        const nameInput: HTMLInputElement = fixture.nativeElement.querySelector("#login_username");
        nameInput.value = "admin";
        nameInput.dispatchEvent(new Event('input'));
        const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector("#login_password");
        passwordInput.value = "Harbor12345";
        passwordInput.dispatchEvent(new Event('input'));
        const signButton: HTMLAnchorElement = fixture.nativeElement.querySelector("#log_in");
        signButton.click();
    }
});
