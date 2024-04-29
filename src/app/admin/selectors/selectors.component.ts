import { ChangeDetectorRef, Component } from '@angular/core';
import { Selector } from '../../model/Selector';
import { ApiWebsiteService } from '../../services/api-website.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-selectors',
  templateUrl: './selectors.component.html',
  styleUrls: ['./selectors.component.css']
})
export class SelectorsComponent {
  selectors: Selector[] = [];
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;

  constructor(
    private selectorService: ApiWebsiteService,
    private router: Router,  private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.getSelectors();
  }
  onPageChange(page: number): void {
    console.log('Page index changed:', page);

    this.currentPage = page + 1;
    this.getSelectors();
  }
  getSelectors(): void {
    this.selectorService.getSelectors(this.currentPage, this.pageSize)
      .subscribe(
        (response: any) => {
          this.selectors = response.results;
          this.totalItems = response.count;
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Error fetching selectors:', error);
        }
      );
  }
  deleteSelector(id: number): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to delete this selector?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectorService.deleteSelector(id)
          .subscribe(() => {
            this.selectors = this.selectors.filter(selector => selector.id !== id);
          });
      }
    });
  }

  // editSelector(selector: Selector): void {
  //   const id = selector.id;
  //   if (id === undefined) {
  //     console.error('Error: Selector id is undefined');
  //     return;
  //   }
  //   Swal.fire({
  //     title: 'Edit Selector',
  //     html:
  //       `<div class="form-group">
  //         <label for="swal-input1" class="form-label">Name</label>
  //         <input id="swal-input1" class="form-control" placeholder="Name" value="${selector.name}">
  //       </div>
  //       <div class="form-group">
  //         <label for="swal-input2" class="form-label">Description</label>
  //         <input id="swal-input2" class="form-control" placeholder="Description" value="${selector.description}">
  //       </div>`,
  //     focusConfirm: false,
  //     preConfirm: () => {
  //       const name = (<HTMLInputElement>document.getElementById('swal-input1')).value;
  //       const description = (<HTMLInputElement>document.getElementById('swal-input2')).value;
  //       const editedSelector: Selector = { ...selector, name: name, description: description };
  //       return this.selectorService.updateSelector(id, editedSelector)
  //         .toPromise()
  //         .then(() => {
  //           this.getSelectors();
  //         })
  //         .catch(error => {
  //           console.error('Error editing selector:', error);
  //         });
  //     }
  //   });
  // }

  // openAddSelectorForm(): void {
  //   Swal.fire({
  //     title: 'Add Selector',
  //     html:
  //       `<div class="form-group">
  //         <label for="swal-input1" class="form-label">Name</label>
  //         <input id="swal-input1" class="form-control" placeholder="Name">
  //       </div>
  //       <div class="form-group">
  //         <label for="swal-input2" class="form-label">Description</label>
  //         <input id="swal-input2" class="form-control" placeholder="Description">
  //       </div>`,
  //     focusConfirm: false,
  //     preConfirm: () => {
  //       const name = (<HTMLInputElement>document.getElementById('swal-input1')).value;
  //       const description = (<HTMLInputElement>document.getElementById('swal-input2')).value;
  //       const newSelector: Selector = { id: 0, name: name, description: description };
  //       return this.selectorService.createSelector(newSelector)
  //         .toPromise()
  //         .then(() => {
  //           this.getSelectors();
  //         })
  //         .catch(error => {
  //           console.error('Error adding selector:', error);
  //         });
  //     }
  //   });
  // }
}
