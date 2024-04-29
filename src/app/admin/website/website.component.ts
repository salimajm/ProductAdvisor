import { Component, OnInit } from '@angular/core';
import { ApiWebsiteService } from '../../services/api-website.service';
import { Website } from '../../model/Website';
import { Selector } from '../../model/Selector';
import { Observable, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-website',
  templateUrl: './website.component.html',
  styleUrls: ['./website.component.css']
})
export class WebsiteComponent implements OnInit {
  websites: Website[] = [];
  websitesWithSelectors: Website[] = [];
  loading: boolean = true;
  websiteId!: number;
  totalItems: number = 0;
pageSize: number = 5;
currentPage: number = 1;
// Dans votre composant WebsiteComponent
pageIndex = 0;

  constructor(private websiteService: ApiWebsiteService) { }

  ngOnInit(): void {
    this.loadWebsitesWithSelectors();
  }
  getObjectEntries(obj: any): any[] {
    if (obj) {
      return Object.entries(obj);
    } else {
      return [];
    }
  }
  scrapeWebsite(websiteId: number) {
    Swal.fire({
      title: 'Please wait',
      text: 'Scraping in progress...',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    this.websiteService.scrapeWebsite(websiteId).subscribe(
      response => {
        Swal.fire({
          icon: 'success',
          title: 'Scraping successful',
          text: 'Please wait while we complete the process.',
          showConfirmButton: false,
          timer: 2000
        });

        console.log(response);
      },
      error => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
      }
    );
  }

  logWebsitesWithSelectors(): void {
    this.websitesWithSelectors.forEach(website => {
      console.log("Website:", website.name);
      if (website.selectors) {
        website.selectors.forEach((selector: any, index: number) => {
          console.log(`Selector ${index + 1}:`, selector);
        });
      } else {
        console.log("No selectors found for website:", website.name);
      }
    });
  }

  loadWebsitesWithSelectors(): void {
    this.websiteService.getWebsites(this.currentPage, this.pageSize).subscribe(
      websites => {
        this.loading = true;
        const observables: Observable<any>[] = [];

        websites.forEach(website => {
          observables.push(this.getSelectorsForWebsite(website.id));
        });

        forkJoin(observables).subscribe(
          results => {
            results.forEach((selectors, index) => {
              if (selectors && selectors.length > 0) {
                websites[index].selectors = selectors.map((selector: Selector) => selector.selectors);
              }
            });
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;

            this.websitesWithSelectors = websites.slice(startIndex, endIndex);
            console.log('Selectors and their types:', this.websitesWithSelectors);
            this.totalItems = websites.length; // Assurez-vous de récupérer le nombre total d'éléments depuis le backend si les données sont paginées côté serveur

            this.loading = false;
            this.logWebsitesWithSelectors();

          },
          error => {
            console.error('Error loading selectors:', error);
            this.loading = false;
          }
        );
      },
      error => {
        console.error('Error loading websites:', error);
        this.loading = false;
      }
    );
  }

  openWebsiteDialog(): void {
    let htmlContent = `
      <style>
        .container {
          max-width: 90vw;
          overflow-x: auto;
          margin: 20px auto;
          transition: max-height 0.3s ease-out;
        }

        .expanded {
          max-height: 80vh;
        }

        .form-label {
          width: 150px;
          text-align: right;
          margin-right: 10px;
        }

        .form-control {
          flex: 1; /* Allow inputs to grow */
        }


        .form-group.row {
          display: flex;
          align-items: center; /* Vertically align content within rows */
        }


        .col-sm-10 {
          flex: 0 0 calc(100% - 200px); /* Set fixed width for inputs */
        }

        .col-form-label {
          width: 180px;
          margin-right: 10px;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-top: 5px; /* Adjust as needed for vertical alignment */
        }

      </style>
      <div class="container">
        <form>
          <div class="form-group row">
            <label for="name" class="col-sm-4 col-form-label">Name:</label>
            <div class="col-sm-10">
              <input id="name" class="form-control" placeholder="Enter site name">
            </div>
          </div>
          <div class="form-group row">
            <label for="url" class="col-sm-4 col-form-label">URL:</label>
            <div class="col-sm-10">
              <input id="url" class="form-control" placeholder="Enter site URL">
            </div>
          </div>
          <div id="selectors-container" class="selectors-container form-group row">
          </div>
        </form>
      </div>`;

    Swal.fire({
      title: 'Add a Website',
      html: htmlContent,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Submit',
      allowOutsideClick: () => !Swal.isLoading(),
      focusConfirm: false,
      footer: '<button id="add-selector-btn" class="btn btn-warning btn-sm">+ Add another selector</button>',
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const url = (document.getElementById('url') as HTMLInputElement).value;
        const selectors = this.getSelectorsFromInputs();
        if (name && url && selectors) {
          this.addWebsiteWithSelectors(name, url, selectors);
        } else {
          console.error('Name, URL, and selectors are missing.');
        }
      },
      didOpen: () => {
        this.addSelectorInputs();

        const addButton = document.getElementById('add-selector-btn');
        if (addButton) {
          addButton.onclick = () => {
            this.addSelectorInputs();
          };
        } else {
          console.error('The "Add a selector" button is null.');
        }
      }
    });
  }

  addSelectorInputs(): void {
    const container = document.getElementById('selectors-container');
    if (container) {
      const existingSelectors = container.querySelectorAll('.selector-input').length + 1;

      const selectorDiv = document.createElement('div');
      selectorDiv.classList.add('selector-input', 'form-group', 'row', 'mb-2');

      const labelDiv = document.createElement('div');
      labelDiv.classList.add('col-sm-4');
      const label = document.createElement('label');
      label.setAttribute('for', `-${existingSelectors}`);
      label.classList.add('col-form-label');
      label.textContent = `Selector ${existingSelectors}:`;
      labelDiv.appendChild(label);

      const inputDiv = document.createElement('div');
      inputDiv.classList.add('col-sm-10', 'd-flex', 'align-items-start');
      inputDiv.innerHTML = `
      <div id="selector-${existingSelectors}" class="row mb">
      <div class="col">
        <input id="type-${existingSelectors}" class="form-control type" placeholder="Type" style="width: 100%;">
      </div>
      <div class="col">
        <input id="selector-${existingSelectors}" class="form-control selector" placeholder="Selector" style="width: 100%;">
      </div>
    </div>
    `;
      selectorDiv.appendChild(labelDiv);
      selectorDiv.appendChild(inputDiv);
      container.appendChild(selectorDiv);
      if (existingSelectors > 2) {
        container.classList.add('expanded');
      }
    } else {
      console.error('Container is null.');
    }
  }


  onSelectorChange(selectedSelector: string, website: Website): void {
    console.log('Selected selector:', selectedSelector);
    console.log('Website:', website);
  }

  getSelectorsFromInputs(): { type: string; selector: string }[] | null {
    const container = document.getElementById('selectors-container');
    if (container) {
      const selectorInputs = container.querySelectorAll('.selector-input');
      const selectors: { type: string; selector: string }[] = [];
      selectorInputs.forEach(input => {
        const typeInput = input.querySelector('.type') as HTMLInputElement;
        const selectorInput = input.querySelector('.selector') as HTMLInputElement;
        if (typeInput && selectorInput) {
          const type = typeInput.value;
          const selector = selectorInput.value;
          if (type && selector) {
            selectors.push({ type: type, selector: selector });
          }
        }
      });
      return selectors.length > 0 ? selectors : null;
    } else {
      console.error('Container is null.');
      return null;
    }
  }

  addWebsiteWithSelectors(name: string, url: string, selectors: any[]): void {
    const newWebsite: Website = { id: 0, name: name, url: url, selectors: selectors };
    this.websiteService.createWebsite(newWebsite).subscribe(
      response => {
        console.log('Website added successfully:', response);
        const websiteId = response.id;
        selectors.forEach(selector => {
          const newSelector: Selector = { id: 0, website: websiteId, selectors: selector };
          this.websiteService.createSelector(newSelector).subscribe(
            selectorResponse => {
              console.log('Selector added successfully:', selectorResponse);
            },
            selectorError => {
              console.error('Error adding selector:', selectorError);
            }
          );
        });
        this.loadWebsitesWithSelectors();
        Swal.fire(
          'Success!',
          'Site added successfully.',
          'success'
        );
      },
      error => {
        console.error('Error adding website:', error);
        Swal.fire(
          'Error!',
          'Try again later!!.',
          'error'
        );
      }
    );
  }

  getSelectorsForWebsite(websiteId: number): Observable<any> {
    return this.websiteService.getSelectorsForWebsite(websiteId);
  }

  getObjectKeys(obj: any): string[] {
    if (obj && typeof obj === 'object') {
      return Object.keys(obj);
    } else {
      return [];
    }
  }

  editWebsite(website: Website): void {
    Swal.fire({
      title: 'Edit Website',
      html:
        `<div style="display: flex; flex-direction: column;">
          <div style="margin-bottom: 10px; display: flex; align-items: center;">
            <label for="name" style="width: 100px; margin-right: 10px;">Name:</label>
            <input id="name" class="swal2-input" value="${website.name}" placeholder="Name">
          </div>
          <div style="margin-bottom: 10px; display: flex; align-items: center;">
            <label for="url" style="width: 100px; margin-right: 10px;">URL:</label>
            <input id="url" class="swal2-input" value="${website.url}" placeholder="URL">
          </div>
          <div style="margin-bottom: 10px; display: flex; align-items: center;">
            <label for="selectors" style="width: 100px; margin-right: 10px;">Selectors:</label>
            <textarea id="selectors" class="swal2-textarea" placeholder="Selectors" contenteditable="true">${JSON.stringify(website.selectors)}</textarea>
          </div>
        </div>`,
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const url = (document.getElementById('url') as HTMLInputElement).value;
        const selectors = JSON.parse((document.getElementById('selectors') as HTMLTextAreaElement).value);
        this.editWebsiteWithSelectors(website.id, name, url, selectors);
      }
    });
  }

  editWebsiteWithSelectors(websiteId: number, name: string, url: string, selectors: any): void {
    const updatedWebsiteData = {
      website: {
        websiteId: websiteId,
        name: name,
        url: url
      },
      selectors: selectors
    };

    console.log('Structure of updatedWebsiteData:', updatedWebsiteData);
    this.websiteService.editWebsiteWithSelectors(websiteId, updatedWebsiteData).subscribe(
      response => {
        console.log('Website updated successfully:', response);
        this.loadWebsitesWithSelectors();
      },
      error => {
        console.error('Error updating website:', error);
      }
    );
  }

  deleteWebsite(websiteId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this website!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Website ID to be deleted:', websiteId);
        this.websiteService.deleteWebsite(websiteId).subscribe(
          response => {
            console.log('Website deleted successfully:', response);
            this.websitesWithSelectors = this.websitesWithSelectors.filter(website => website.id !== websiteId);
            Swal.fire(
              'Deleted!',
              'Your website has been deleted.',
              'success'
            );
          },
          error => {
            console.error('Error deleting website:', error);
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Your website is safe :)',
          'error'
        );
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1; // Mettez à jour l'index de la page actuelle
    this.loadWebsitesWithSelectors(); // Rechargez les données des sites Web avec les sélecteurs en fonction de la nouvelle page
  }

}
