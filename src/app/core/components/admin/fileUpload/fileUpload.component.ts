import { Component, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/Alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { environment } from 'environments/environment';
import { FileUpload } from './models/fileupload';
import { FileUploadService } from './services/fileupload.service';
import { EnumFile } from './models/EnumFile';




declare var jQuery: any;
declare const pdfjsLib: any;


@Component({
	selector: 'app-fileUpload',
	templateUrl: './fileUpload.component.html',
	styleUrls: ['./fileUpload.component.scss']
})
export class FileUploadComponent implements AfterViewInit, OnInit {
	
	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['createdUserId','createdDate','status','fileName','filePath', 'update','delete'];

	fileUploadList:FileUpload[];
	fileUpload:FileUpload=new FileUpload();

	fileUploadAddForm: FormGroup;
	selectedFile: File;
	fileInput: ElementRef;

	
	
	selectedPage:string;
	keys = Object.keys;
	page = EnumFile;

	pdfUrl: string = 'assets/uploads/1e5cb766-1ea3-4657-98fe-667003445edf.pdf';

	fileUploadId:number;

	constructor(private fileUploadService:FileUploadService, private lookupService:LookUpService,private alertifyService:AlertifyService,private formBuilder: FormBuilder, private authService:AuthService) { }

	

    ngAfterViewInit(): void {
        this.getFileUploadList();
    }

	ngOnInit() {
		this.authService.getCurrentUserId();
		this.getNumberOfPages();

		this.createFileUploadAddForm();
	}


	getFileUploadList() {
		this.fileUploadService.getFileUploadList().subscribe(data => {
			this.fileUploadList = data;
			this.dataSource = new MatTableDataSource(data);
            this.configDataTable();
		});
	}
	onPageSelected(event){
		this.selectedPage=event.target.enum
	}
	getNumberOfPages(): void {
		const loadingTask = pdfjsLib.getDocument(this.pdfUrl);
		loadingTask.promise.then((pdf: any) => {
		  const numPages = pdf.numPages;
		  console.log('Sayfa Sayısı:', numPages);
		}).catch((error: any) => {
		  console.error('PDF yüklenirken bir hata oluştu:', error);
		});
	  }
	getImagePath(): string {
		const selectedPage = this.fileUploadAddForm.get('page').value;

		switch (selectedPage) {
		  case EnumFile.normal:
			return 'assets/img/cover.jpeg';
		  case EnumFile.ikili:
			return 'assets/img/sidebar-3.jpg';
		  case EnumFile.altılı:
			return 'assets/img/sidebar-4.jpg';
		  default:
			return '';
			
		}
		
	  }
	  onFileSelected(event) {
		this.selectedFile = event.target.files[0];
	  }
	  
	save(){

		if (this.fileUploadAddForm.valid) {
			this.fileUpload = Object.assign({}, this.fileUploadAddForm.value)
		
			if (this.fileUpload.id == 0) {
				this.fileUpload.createdUserId = this.authService.getCurrentUserId();
				this.fileUpload.fileData = this.selectedFile;
			
				this.addFileUpload();
			  }
			else{
				this.fileUpload.createdUserId=this.authService.getCurrentUserId();

				this.updateFileUpload();
		
			}
		}
	}

	addFileUpload(){

		this.fileUploadService.addFileUpload(this.fileUpload).subscribe(data => {
			this.getFileUploadList();
			this.fileUpload = new FileUpload();
			
			jQuery('#fileupload').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.fileUploadAddForm);

		})

	}

	updateFileUpload(){

		this.fileUploadService.updateFileUpload(this.fileUpload).subscribe(data => {

			var index=this.fileUploadList.findIndex(x=>x.id==this.fileUpload.id);
			this.fileUploadList[index]=this.fileUpload;
			this.dataSource = new MatTableDataSource(this.fileUploadList);
            this.configDataTable();
			this.fileUpload = new FileUpload();
			jQuery('#fileupload').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.fileUploadAddForm);

		})

	}

	createFileUploadAddForm() {
		this.fileUploadAddForm = this.formBuilder.group({		
			id : [0],
createdUserId : [0, Validators.required],
lastUpdatedUserId : [0, Validators.required],
status : [true, Validators.required],
fileData: ['', Validators.required],
page:[" ", Validators.required]
})
	}

	deleteFileUpload(fileUploadId:number){
		this.fileUploadService.deleteFileUpload(fileUploadId).subscribe(data=>{
			this.alertifyService.success(data.toString());
			this.fileUploadList=this.fileUploadList.filter(x=> x.id!=fileUploadId);
			this.dataSource = new MatTableDataSource(this.fileUploadList);
			this.configDataTable();
		})
	}

	getFileUploadById(fileUploadId:number){
		this.clearFormGroup(this.fileUploadAddForm);
		this.fileUploadService.getFileUploadById(fileUploadId).subscribe(data=>{
			this.fileUpload=data;
			this.fileUploadAddForm.patchValue(data);
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
