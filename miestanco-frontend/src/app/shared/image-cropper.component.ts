import {
  Component, EventEmitter, Input, OnInit,
  Output, ChangeDetectionStrategy, signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperComponent as NgxCropper, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, NgxCropper],
  template: `
    <div class="cropper-overlay" (click)="onOverlayClick($event)">
      <div class="cropper-modal" (click)="$event.stopPropagation()">
        <div class="cropper-header">
          <span class="cropper-title">Recortar foto</span>
          <button class="cropper-close" (click)="cancelar()"><mat-icon>close</mat-icon></button>
        </div>

        <div class="cropper-viewport">
          <image-cropper
            [imageFile]="file"
            [maintainAspectRatio]="true"
            [aspectRatio]="1 / 1"
            [resizeToWidth]="600"
            [resizeToHeight]="600"
            format="jpeg"
            [autoCrop]="true"
            (imageCropped)="imageCropped($event)"
            style="max-height: 50vh;"
          ></image-cropper>
        </div>

        <div class="cropper-footer">
          <button class="cropper-btn-cancel" (click)="cancelar()">Cancelar</button>
          <button class="cropper-btn-ok" (click)="confirmar()">
            <mat-icon>crop</mat-icon> Aplicar recorte
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cropper-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.75);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
    }
    .cropper-modal {
      background: var(--surface); border-radius: var(--r-lg);
      width: min(500px, 96vw); overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,.5);
    }
    .cropper-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: .85rem 1rem; border-bottom: 1px solid var(--border);
    }
    .cropper-title { font-weight: 700; font-size: .95rem; color: var(--text); }
    .cropper-close {
      background: none; border: none; cursor: pointer; color: var(--text-3);
      display: flex; padding: .2rem; border-radius: 50%;
      &:hover { background: var(--surface-2); }
    }

    .cropper-viewport {
      position: relative; width: 100%;
      background: #111;
    }
    
    .cropper-footer {
      display: flex; gap: .75rem; padding: .85rem 1rem; justify-content: flex-end;
      border-top: 1px solid var(--border);
    }
    .cropper-btn-cancel {
      padding: .55rem 1.1rem; border-radius: var(--r-md);
      border: 1.5px solid var(--border-2); background: none;
      color: var(--text-2); font-family: var(--font); font-size: .9rem; cursor: pointer;
    }
    .cropper-btn-ok {
      display: flex; align-items: center; gap: .4rem;
      padding: .55rem 1.2rem; border-radius: var(--r-md);
      background: var(--primary); color: #fff; border: none;
      font-family: var(--font); font-size: .9rem; font-weight: 600; cursor: pointer;
      mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
      &:hover { background: var(--primary-h); }
    }
  `]
})
export class ImageCropperComponent {
  @Input() file!: File;
  @Output() cropped = new EventEmitter<Blob>();
  @Output() cancelled = new EventEmitter<void>();

  private croppedBlob: Blob | null | undefined = null;

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBlob = event.blob;
  }

  onOverlayClick(e: MouseEvent) {
    this.cancelar();
  }

  cancelar() {
    this.cancelled.emit();
  }

  confirmar() {
    if (this.croppedBlob) {
      this.cropped.emit(this.croppedBlob);
    }
  }
}
