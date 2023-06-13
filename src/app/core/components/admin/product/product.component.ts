import { Component, AfterViewInit, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { AlertifyService } from "app/core/services/Alertify.service";
import { AuthService } from "app/core/components/admin/login/services/auth.service";
import { Product } from "./models/product";
import { ProductService } from "./services/product.service";
import { environment } from "environments/environment";
import { LookUpService } from "app/core/services/lookUp.service";
import { LookUp } from "app/core/models/LookUp";
import { DatePipe } from "@angular/common";
import { ProductDto } from "./models/productDto";
import { ESize } from "./models/eSize";

declare var jQuery: any;

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.scss"],
})
export class ProductComponent implements AfterViewInit, OnInit {
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = [
    "userName",
    "createdDate",
    "productName",
    "productColor",
    "size",
    "update",
    "delete",
  ];

  userLookups: LookUp[];
  productList: Product[];
  productDtoList: ProductDto[];

  keys = Object.keys;
  size = ESize;

  productDto: ProductDto = new ProductDto();
  product: Product = new Product();
  productAddForm: FormGroup;

  productId: number;

  constructor(
    private productService: ProductService,
    private datePipe: DatePipe,
    private lookupService: LookUpService,
    private alertifyService: AlertifyService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    this.getProductDtoList();
  }

  ngOnInit() {
    this.authService.getCurrentUserId();
    this.createProductAddForm();
    this.getUserLookUps();


  }

  getUserLookUps() {
    this.lookupService.getUserLookUp().subscribe(
      (lookUps) => {
        this.userLookups = lookUps;
      },
      (error) => {
        console.error("Error retrieving user lookups:", error);
      }
    );
  }
  getProductDtoList() {
    this.productService.getProductDtoList().subscribe((data) => {

      this.productDtoList = data;

      this.productDtoList.forEach((product) => {
        product.createdDate = this.datePipe.transform(
          product.createdDate,
          "dd/MM/yyyy"
        );
      });
      this.dataSource = new MatTableDataSource(data);
      this.configDataTable();
    });
  }

  save() {
    if (this.productAddForm.valid) {
      this.product = Object.assign({}, this.productAddForm.value);

      if (this.product.id == 0) {
		this.productService.setSize(this.product.size);
		this.product.createdUserId=this.authService.getCurrentUserId();
        this.addProduct();
       
      } else {
		this.productService.setSize(this.product.size);
		this.product.lastUpdatedUserId=this.authService.getCurrentUserId();
        this.updateProduct();
       

      }
    }
  }

  addProduct() {
    this.productService.addProduct(this.product).subscribe(
      (data) => {
        this.getProductDtoList();
        this.product = new Product();
        jQuery("#product").modal("hide");
        this.alertifyService.success(data);
        this.clearFormGroup(this.productAddForm);
        console.log(this.product);
      },

      (error) => {
        console.error(error);
        this.alertifyService.error(error.name);
      }
    );
  }

  updateProduct() {
	this.productService.updateProduct(this.product).subscribe((data) => {
		if (this.productList && this.productList.length > 0) {
		  var index = this.productList.findIndex((x) => x.id == this.product.id);
		  if (index !== -1) {
			this.productList[index] = this.product;
			this.dataSource = new MatTableDataSource(this.productList);
			this.configDataTable();
		  }
		}
		if (this.productDtoList && this.productDtoList.length > 0) {
			var dtoIndex = this.productDtoList.findIndex((x) => x.id == this.product.id);
			if (dtoIndex !== -1) {
			  this.productDtoList[dtoIndex] = this.product;
			}
		  }
		this.getProductDtoList();

      this.product = new Product();
      jQuery("#product").modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.productAddForm);
    });
  }

  createProductAddForm() {
   

    this.productAddForm = this.formBuilder.group({
      id: [0, Validators.required],
      createdUserId: [0],
      lastUpdatedUserId: [0],
      productName: ["", Validators.required],
      productColor: ["", Validators.required],
      size: ["", Validators.required],
    });
  }

  deleteProduct(productId: number) {
    this.productService.deleteProduct(productId).subscribe((data) => {
      this.alertifyService.success(data.toString());
      this.productList = this.productList.filter((x) => x.id != productId);
      this.dataSource = new MatTableDataSource(this.productList);
      this.configDataTable();
    });
  }

  getProductById(productId: number) {
    this.clearFormGroup(this.productAddForm);
    this.productService.getProductById(productId).subscribe((data) => {
      this.product = data;
      this.productAddForm.patchValue(data);
    });
  }

  clearFormGroup(group: FormGroup) {
    group.markAsUntouched();
    group.reset();

    Object.keys(group.controls).forEach((key) => {
      group.get(key).setErrors(null);
      if (key == "id") group.get(key).setValue(0);
      if ((key = "productName")) group.get(key).setValue("");
      if ((key = "productColor")) group.get(key).setValue("");
      if (key == "size") group.get(key).setValue("");
      if (key == "status") group.get(key).setValue(true);
      if (key == "isDeleted") group.get(key).setValue(false);
      if (key == "createdUserId")
        group.get(key).setValue(0);
      if (key == "createdDate") group.get(key).setValue(Date.now);
      if (key == "lastUpdatedUserId")
        group.get(key).setValue(0);
      if (key == "lastUpdatedDate") group.get(key).setValue(Date.now);
    });
  }

  checkClaim(claim: string): boolean {
    return this.authService.claimGuard(claim);
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
