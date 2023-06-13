import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/Alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Order } from './models/order';
import { OrderService } from './services/order.service';
import { Product } from '../product/models/product';
import { Observable } from 'rxjs';
import { ProductService } from '../product/services/product.service';
import { map, startWith } from 'rxjs/operators';
import { Customer } from '../customer/models/customer';
import { CustomerService } from '../customer/services/customer.service';
import { OrderDto } from './models/orderDto';
import { ESize } from '../product/models/eSize';

declare var jQuery: any;

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss']
})
export class OrderComponent implements AfterViewInit, OnInit {
	
	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['customerName','productName','createdDate','status','amount','size', 'update','delete'];
	orderDtoList:OrderDto[];
	orderList:Order[];
	order:Order=new Order();
	productlookUp:Product[] = [];
	costumer:Customer[] =[];
	orderAddForm: FormGroup;

	filteredProducts: Observable<Product[]>;
	filteredCustomers: Observable<Customer[]>;

	orderId:number;



	constructor(private orderService:OrderService,private costumerService:CustomerService, private productService:ProductService,private lookupService:LookUpService,private alertifyService:AlertifyService,private formBuilder: FormBuilder, private authService:AuthService) { }


	keys=Object.keys;
	size=ESize;


    ngAfterViewInit(): void {
        this.getOrderDtoList();
		
    }

	ngOnInit() {

		this.createOrderAddForm();
		this.authService.getCurrentUserId();
		this.getProductList();
		this.getCustomerList();
		

	}


	getOrderDtoList() {
		this.orderService.getOrderDtoList().subscribe(data => {
			this.orderDtoList = data;
			this.dataSource = new MatTableDataSource(data);
            this.configDataTable();
		});
	}
	getCustomerList() {
		this.costumerService.getCustomerList().subscribe(data => {
			this.costumer = data;
			this.filteredCustomers = this.orderAddForm.controls.customerId.valueChanges.pipe(
				startWith(''),
				map(value1 => typeof value1 === 'string' ? value1 : value1.customerName),
				map(name1 => name1 ? this._filter1(name1) : this.costumer.slice())
			);
		})
	}
	private _filter1(value: string): Customer[] {
		const filterValue1 = value.toLowerCase();

		return this.costumer.filter(option => option.customerName.toLowerCase().includes(filterValue1));
	}

	displayFn1(customer: Customer): string {
		return customer && customer.customerName ? customer.customerName : '';
	}

	getProductList() {
		this.productService.getProductList().subscribe(data => {
			this.productlookUp = data;

			this.filteredProducts = this.orderAddForm.controls.productId.valueChanges.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value.productName),
				map(name => name ? this._filter(name) : this.productlookUp.slice())
			);
		})
	}	
	private _filter(value: string): Product[] {
		const filterValue = value.toLowerCase();

		return this.productlookUp.filter(option => option.productName.toLowerCase().includes(filterValue));
	}
	displayFn(product: Product): string {
		return product && product.productName ? product.productName : '';
	}

	save(){

		if (this.orderAddForm.valid) {
			this.order = Object.assign({}, this.orderAddForm.value)
			this.order.productId = this.orderAddForm.controls.productId.value.id
			this.order.customerId = this.orderAddForm.controls.customerId.value.id

			if (this.order.id == 0)
				this.addOrder();
			else
				this.updateOrder();
		}

	}

	addOrder(){

		this.orderService.addOrder(this.order).subscribe(data => {
			
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			
			this.clearFormGroup(this.orderAddForm);
			console.log(this.createOrderAddForm);
			this.getOrderDtoList();
			

		},
		(error) => {
			console.error(error);
			this.alertifyService.error(error.error);
		  }
		); 
		

	}

	updateOrder(){

		this.orderService.updateOrder(this.order).subscribe(data => {

			var index=this.orderList.findIndex(x=>x.id==this.order.id);
			this.orderList[index]=this.order;
			this.dataSource = new MatTableDataSource(this.orderList);
            this.configDataTable();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);

		})

	}

	createOrderAddForm() {
		const currentUserId = this.authService.getCurrentUserId();

		this.orderAddForm = this.formBuilder.group({		
			id: [0],
			createdUserId: [currentUserId],
    		lastUpdatedUserId: [currentUserId],
			status: [true, Validators.required],
			isDeleted: [false,Validators.required],
			productId: [0, Validators.required],
			customerId: [0, Validators.required],
			amount: [0, Validators.required],
			size: ['', Validators.required],
		})
	}

	deleteOrder(orderId:number){
		this.orderService.deleteOrder(orderId).subscribe(data=>{
			this.alertifyService.success(data.toString());
			this.orderList=this.orderList.filter(x=> x.id!=orderId);
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
		})
	}

	getOrderById(orderId:number){
		this.clearFormGroup(this.orderAddForm);
		this.orderService.getOrderById(orderId).subscribe(data=>{
			this.order=data;
			this.orderAddForm.patchValue(data);
		})
	}


	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
			if (key == 'status')
				group.get(key).setValue(true);
			if (key == 'isDeleted')
				group.get(key).setValue(false);
			if (key == 'productId')
				group.get(key).setValue(0);
			if (key == 'amount')
				group.get(key).setValue(0);
			if (key == 'customerId')
				group.get(key).setValue(0);
			if (key == 'size')
				group.get(key).setValue("");
			if (key == 'createdUserId')
				group.get(key).setValue(this.authService.getCurrentUserId());
			if (key == 'lastUpdatedUserId')
				group.get(key).setValue(this.authService.getCurrentUserId());
			if (key == 'createdDate')
				group.get(key).setValue(Date.now);
			if (key == 'lastUpdatedDate')
				group.get(key).setValue(Date.now);
		});
	}

	checkClaim(claim:string):boolean{
		return this.authService.claimGuard(claim)
	}

	configDataTable(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

  }
