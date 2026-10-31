import React from 'react';
/** A tiny bahi-khata: its cover turns on hover, keyboard focus and active tap.
 * Decorative only; the visible button label always remains readable. */
export function KhataGlyph({icon,small=false}:{icon:string;small?:boolean}){
 return <span className={'vt-book '+(small?'vt-mini-book':'')} aria-hidden="true">
   <span className="vt-book-pages"><i/><i/><i/></span>
   <span className="vt-book-cover"><span className="material-symbols-outlined">{icon}</span></span>
 </span>;
}
