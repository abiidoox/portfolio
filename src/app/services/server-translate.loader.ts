import { Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Server-side translation loader used while prerendering.
 *
 * The HTTP loader cannot be used during prerender: the internal prerender
 * server only answers application routes, so a relative fetch for
 * `/assets/i18n/<lang>.json` is never answered and prerendering times out.
 * Reading the same files from disk keeps the prerendered HTML fully
 * translated.
 */
@Injectable()
export class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    const file = join(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`);
    return new Observable<TranslationObject>(subscriber => {
      readFile(file, 'utf-8')
        .then(text => {
          subscriber.next(JSON.parse(text) as TranslationObject);
          subscriber.complete();
        })
        .catch(err => subscriber.error(err));
    });
  }
}
