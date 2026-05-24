import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App implements OnInit {
  private swUpdate = inject(SwUpdate, { optional: true });

  ngOnInit() {
    // Auto-activar nueva versión del service worker cuando esté disponible
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
        .subscribe(() => {
          this.swUpdate!.activateUpdate().then(() => document.location.reload());
        });

      // Comprobar actualizaciones al iniciar
      this.swUpdate.checkForUpdate().catch(() => {});
    }
  }
}
