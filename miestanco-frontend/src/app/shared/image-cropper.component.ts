import {
  Component, ElementRef, EventEmitter, Input, OnInit,
  Output, ViewChild, signal, ChangeDetectionStrategy
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="cropper-overlay" (click)="onOverlayClick($event)">
      <div class="cropper-modal" (click)="$event.stopPropagation()">
        <div class="cropper-header">
          <span class="cropper-title">Recortar foto</span>
          <button class="cropper-close" (click)="cancelar()"><mat-icon>close</mat-icon></button>
        </div>

        <div class="cropper-viewport" #viewport
             (mousedown)="startDrag($event)"
             (touchstart)="startDragTouch($event)"
             (wheel)="onWheel($event)">
          <img #imgEl [src]="srcUrl()" class="cropper-img"
               [style.transform]="imgTransform()"
               [style.width.px]="imgW()"
               [style.height.px]="imgH()"
               (load)="onImgLoad()" draggable="false" />
          <!-- Marco de recorte -->
          <div class="cropper-frame"></div>
          <!-- Sombras laterales -->
          <div class="cropper-shadow top"></div>
          <div class="cropper-shadow bottom"></div>
          <div class="cropper-shadow left"></div>
          <div class="cropper-shadow right"></div>
        </div>

        <!-- Zoom -->
        <div class="cropper-zoom">
          <mat-icon>zoom_out</mat-icon>
          <input type="range" min="0.5" max="3" step="0.01"
                 [value]="scale()" (input)="onZoom($any($event.target).value)" />
          <mat-icon>zoom_in</mat-icon>
        </div>

        <div class="cropper-footer">
          <button class="cropper-btn-cancel" (click)="cancelar()">Cancelar</button>
          <button class="cropper-btn-ok" (click)="confirmar()">
            <mat-icon>crop</mat-icon> Aplicar recorte
          </button>
        </div>

        <canvas #canvasEl style="display:none"></canvas>
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
      width: min(380px, 96vw); overflow: hidden;
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
      position: relative; width: 100%; aspect-ratio: 1;
      background: #111; overflow: hidden; cursor: grab; user-select: none;
      &:active { cursor: grabbing; }
    }
    .cropper-img {
      position: absolute; top: 0; left: 0;
      transform-origin: top left; will-change: transform;
      pointer-events: none;
    }
    /* Marco cuadrado central */
    .cropper-frame {
      position: absolute;
      inset: 15%;
      border: 2px solid rgba(255,255,255,.9);
      border-radius: 4px;
      box-shadow: 0 0 0 9999px rgba(0,0,0,.45);
      pointer-events: none;
      &::before, &::after {
        content: '';
        position: absolute;
        width: 18px; height: 18px;
        border-color: #fff; border-style: solid;
      }
      &::before { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
      &::after  { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }
    }
    .cropper-shadow { position: absolute; background: rgba(0,0,0,.45); pointer-events: none; }
    .cropper-shadow.top    { top: 0; left: 0; right: 0; height: 15%; }
    .cropper-shadow.bottom { bottom: 0; left: 0; right: 0; height: 15%; }
    .cropper-shadow.left   { top: 15%; bottom: 15%; left: 0; width: 15%; }
    .cropper-shadow.right  { top: 15%; bottom: 15%; right: 0; width: 15%; }

    .cropper-zoom {
      display: flex; align-items: center; gap: .75rem;
      padding: .75rem 1rem; background: var(--surface-2);
      mat-icon { color: var(--text-3); font-size: 18px !important; width: 18px !important; height: 18px !important; flex-shrink: 0; }
      input[type=range] { flex: 1; accent-color: var(--primary); }
    }
    .cropper-footer {
      display: flex; gap: .75rem; padding: .85rem 1rem; justify-content: flex-end;
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
export class ImageCropperComponent implements OnInit {
  @Input() file!: File;
  @Output() cropped = new EventEmitter<Blob>();
  @Output() cancelled = new EventEmitter<void>();
  @ViewChild('imgEl') imgEl!: ElementRef<HTMLImageElement>;
  @ViewChild('viewport') viewport!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  srcUrl = signal('');
  scale = signal(1);
  imgW = signal(300);
  imgH = signal(300);
  offsetX = signal(0);
  offsetY = signal(0);

  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private natW = 0;
  private natH = 0;

  ngOnInit() {
    this.srcUrl.set(URL.createObjectURL(this.file));
  }

  imgTransform() {
    return `translate(${this.offsetX()}px, ${this.offsetY()}px)`;
  }

  onImgLoad() {
    const img = this.imgEl.nativeElement;
    this.natW = img.naturalWidth;
    this.natH = img.naturalHeight;
    const vp = this.viewport.nativeElement.clientWidth;
    // Tamaño del marco = 70% del viewport (100% - 2*15%)
    const frameSize = vp * 0.7;
    // Escala inicial: imagen llena el marco
    const initScale = frameSize / Math.min(this.natW, this.natH);
    this.scale.set(+initScale.toFixed(3));
    this.imgW.set(Math.round(this.natW * initScale));
    this.imgH.set(Math.round(this.natH * initScale));
    // Centrar la imagen en el viewport
    this.offsetX.set((vp - this.imgW()) / 2);
    this.offsetY.set((vp - this.imgH()) / 2);
  }

  onZoom(val: string) {
    const vp = this.viewport.nativeElement.clientWidth;
    const newScale = +val;
    const ratio = newScale / this.scale();
    const newW = Math.round(this.natW * newScale);
    const newH = Math.round(this.natH * newScale);
    // Mantener centrado
    this.offsetX.set(Math.round(this.offsetX() * ratio + (this.imgW() - newW) / 2 * 0));
    this.offsetY.set(Math.round(this.offsetY() * ratio + (this.imgH() - newH) / 2 * 0));
    this.scale.set(newScale);
    this.imgW.set(newW);
    this.imgH.set(newH);
    this.clamp();
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newScale = Math.min(3, Math.max(0.5, this.scale() + delta));
    const newW = Math.round(this.natW * newScale);
    const newH = Math.round(this.natH * newScale);
    this.offsetX.set(this.offsetX() + (this.imgW() - newW) / 2);
    this.offsetY.set(this.offsetY() + (this.imgH() - newH) / 2);
    this.scale.set(newScale);
    this.imgW.set(newW);
    this.imgH.set(newH);
    this.clamp();
  }

  startDrag(e: MouseEvent) {
    this.dragging = true;
    this.lastX = e.clientX; this.lastY = e.clientY;
    const onMove = (m: MouseEvent) => {
      if (!this.dragging) return;
      this.offsetX.set(this.offsetX() + m.clientX - this.lastX);
      this.offsetY.set(this.offsetY() + m.clientY - this.lastY);
      this.lastX = m.clientX; this.lastY = m.clientY;
      this.clamp();
    };
    const onUp = () => { this.dragging = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  startDragTouch(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    this.lastX = e.touches[0].clientX; this.lastY = e.touches[0].clientY;
    const onMove = (m: TouchEvent) => {
      if (m.touches.length !== 1) return;
      this.offsetX.set(this.offsetX() + m.touches[0].clientX - this.lastX);
      this.offsetY.set(this.offsetY() + m.touches[0].clientY - this.lastY);
      this.lastX = m.touches[0].clientX; this.lastY = m.touches[0].clientY;
      this.clamp();
    };
    const onUp = () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  private clamp() {
    const vp = this.viewport.nativeElement.clientWidth;
    const frameStart = vp * 0.15;
    const frameEnd = vp * 0.85;
    // La imagen debe cubrir el frame completo
    const maxX = frameStart;
    const minX = frameEnd - this.imgW();
    const maxY = frameStart;
    const minY = frameEnd - this.imgH();
    this.offsetX.set(Math.min(maxX, Math.max(minX, this.offsetX())));
    this.offsetY.set(Math.min(maxY, Math.max(minY, this.offsetY())));
  }

  onOverlayClick(e: MouseEvent) { this.cancelar(); }

  cancelar() {
    URL.revokeObjectURL(this.srcUrl());
    this.cancelled.emit();
  }

  confirmar() {
    const vp = this.viewport.nativeElement.clientWidth;
    const frameSize = vp * 0.7;
    const frameX = vp * 0.15;
    const frameY = vp * 0.15;

    // Coordenadas del frame en el espacio de la imagen
    const imgX = (frameX - this.offsetX()) / this.scale();
    const imgY = (frameY - this.offsetY()) / this.scale();
    const cropW = frameSize / this.scale();
    const cropH = frameSize / this.scale();

    const canvas = this.canvasEl.nativeElement;
    const OUTPUT = 600; // px de salida
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d')!;

    const img = this.imgEl.nativeElement;
    ctx.drawImage(img, imgX, imgY, cropW, cropH, 0, 0, OUTPUT, OUTPUT);

    canvas.toBlob(blob => {
      if (blob) this.cropped.emit(blob);
      URL.revokeObjectURL(this.srcUrl());
    }, 'image/jpeg', 0.88);
  }
}
