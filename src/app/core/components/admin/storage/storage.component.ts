import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/Alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Storage } from './models/storage';
import { StorageService } from './services/storage.service';
import { environment } from 'environments/environment';
import { LookUp } from 'app/core/models/LookUp';
import { StorageDto } from './models/storageDto';
import { Product } from '../product/models/product';
import { ProductService } from '../product/services/product.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { data } from 'jquery';
import { ESize } from '../product/models/eSize';

declare var jQuery: any;

@Component({
	selector: 'app-storage',
	templateUrl: './storage.component.html',
	styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements AfterViewInit, OnInit {
	
	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['userName','createdDate','productName','size','status','unitsInStock','isReady', 'update','delete'];
	userLookups:LookUp[];
	storageList:Storage[];
	storageDtoList:StorageDto[];
	product:Product[] = [];
	storage:Storage=new Storage();

	storageAddForm: FormGroup;
	filteredProducts: Observable<Product[]>;
	lastFilter: string = '';
	selected?:Boolean;

	keys=Object.keys;
	size=ESize;

	storageId:number;

	constructor(private productService:ProductService,private datePipe:DatePipe,private storageService:StorageService, private lookupService:LookUpService,private alertifyService:AlertifyService,private formBuilder: FormBuilder, private authService:AuthService) {  }

    ngAfterViewInit(): void {
        this.getStorageDtoList();
	}

	ngOnInit() {
		this.getProductList();

		this.createStorageAddForm();
		

	}
	getUserLookUps() {
		this.lookupService.getUserLookUp().subscribe(
		  lookUps => {
			this.userLookups = lookUps;
		  },
		  error => {
			console.error('Error retrieving user lookups:', error);
		  }
		);
	}
	
	getProductList() {
		this.productService.getProductList().subscribe(data => {
			this.product = data;
			this.filteredProducts = this.storageAddForm.controls.productId.valueChanges.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value.productName),
				map(name => name ? this._filter(name) : this.product.slice())
			);

		})
	}
	
	getStorageDtoList() {
		this.storageService.getStorageDtoList().subscribe(data => {
			this.storageDtoList = data;

			this.storageDtoList.forEach(storage => {
				storage.createdDate = this.datePipe.transform(storage.createdDate, 'dd/MM/yyyy');
			  });

			this.dataSource = new MatTableDataSource(data);
            this.configDataTable();
		});
	}

	getSizeLabel(size: number): string {
		const sizeKeys = Object.keys(ESize).filter(key => isNaN(Number(key)));
		const sizeValues = sizeKeys.map(key => ESize[key]);
	  
		return sizeValues[size];
	  }

	
	save(){

		if (this.storageAddForm.valid) {
			this.storage = Object.assign({}, this.storageAddForm.value)
			this.storage.productId = this.storageAddForm.controls.productId.value.id
			if (this.storage.id == 0)
				this.addStorage();
			else
				this.updateStorage();
		}

	}

	addStorage() {
		this.storageService.addStorage(this.storage).subscribe(
		  data => {
			this.getStorageDtoList();
			this.storage = new Storage();
			jQuery('#storage').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.storageAddForm);
			console.log(this.storage);
		  },
		  error => {
			console.error(error);
			this.alertifyService.error(error.error);
		  }
		);
	  }
	
	private _filter(value: string): Product[] {
		const filterValue = value.toLowerCase();

		return this.product.filter(option => option.productName.toLowerCase().includes(filterValue));
	}
	displayFn(product: Product): string {
		return product && product.productName ? product.productName : '';
	}

	updateStorage(){

		this.storageService.updateStorage(this.storage).subscribe(data => {

			var index=this.storageList.findIndex(x=>x.id==this.storage.id);
			this.storageList[index]=this.storage;
			this.dataSource = new MatTableDataSource(this.storageList);
            this.configDataTable();
			this.storage = new Storage();
			jQuery('#storage').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.storageAddForm);

		})

	}

	createStorageAddForm() {
		const currentUserId = this.authService.getCurrentUserId();
		this.storageAddForm = this.formBuilder.group({		
			id : [0],
			
			
			createdUserId: [currentUserId],
    		lastUpdatedUserId: [currentUserId],
			status : [true],
			isDeleted: [false,Validators.required],
			productId:[0,Validators.required],
			unitsInStock : [0, Validators.required],
			isReady : ["", Validators.required],
			size:["",Validators.required]
		})
	}

	deleteStorage(storageId:number){
		this.storageService.deleteStorage(storageId).subscribe(data=>{
			this.alertifyService.success(data.toString());
			this.storageList=this.storageList.filter(x=> x.id!=storageId);
			this.dataSource = new MatTableDataSource(this.storageList);
			this.configDataTable();
		})
	}

	getStorageById(storageId:number){
		this.clearFormGroup(this.storageAddForm);
		this.storageService.getStorageById(storageId).subscribe(data=>{
			this.storage=data;
			this.storageAddForm.patchValue(data);
		})
	}


	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
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
