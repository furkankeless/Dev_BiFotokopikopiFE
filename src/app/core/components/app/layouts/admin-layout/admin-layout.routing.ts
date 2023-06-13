import { Routes } from '@angular/router';
import { GroupComponent } from 'app/core/components/admin/group/group.component';
import { LanguageComponent } from 'app/core/components/admin/language/language.component';
import { LogDtoComponent } from 'app/core/components/admin/log/logDto.component';
import { LoginComponent } from 'app/core/components/admin/login/login.component';
import { OperationClaimComponent } from 'app/core/components/admin/operationclaim/operationClaim.component';
import { TranslateComponent } from 'app/core/components/admin/translate/translate.component';
import { UserComponent } from 'app/core/components/admin/user/user.component';
import { LoginGuard } from 'app/core/guards/login-guard';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { CustomerComponent } from 'app/core/components/admin/customer/customer.component';
import { OrderComponent } from 'app/core/components/admin/order/order.component';
import { ProductComponent } from 'app/core/components/admin/product/product.component';
import { StorageComponent } from 'app/core/components/admin/storage/storage.component';
import { FileUploadComponent } from 'app/core/components/admin/fileUpload/fileUpload.component';





export const AdminLayoutRoutes: Routes = [

    { path: 'dashboard',      component: DashboardComponent,canActivate:[LoginGuard] }, 
    { path: 'user',           component: UserComponent, canActivate:[LoginGuard] },
    { path: 'group',          component: GroupComponent, canActivate:[LoginGuard] },
    { path: 'login',          component: LoginComponent },
    { path: 'language',       component: LanguageComponent,canActivate:[LoginGuard]},
    { path: 'translate',      component: TranslateComponent,canActivate:[LoginGuard]},
    { path: 'operationclaim', component: OperationClaimComponent,canActivate:[LoginGuard]},
    { path: 'log',            component: LogDtoComponent,canActivate:[LoginGuard]},
    { path: 'customer', component: CustomerComponent, canActivate: [LoginGuard] },
    { path: 'order', component: OrderComponent, canActivate: [LoginGuard] },
    { path: 'product', component: ProductComponent, canActivate: [LoginGuard] },
     {path: 'storage',component:StorageComponent,canActivate:[LoginGuard]},
     {path: 'fileupload',component:FileUploadComponent,canActivate:[LoginGuard]},

    
];
