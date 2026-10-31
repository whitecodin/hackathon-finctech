import React, {createContext,useContext,useEffect,useState} from 'react';
import {useLanguage} from './LanguageContext.tsx';
export type AppTheme='light'|'dark';
const ThemeContext=createContext<{theme:AppTheme;setTheme:(v:AppTheme)=>void}>({theme:'light',setTheme:()=>{}});
export function ThemeProvider({children}:{children:React.ReactNode}){
 const [theme,setTheme]=useState<AppTheme>(()=>{try{return localStorage.getItem('vyapartrust-theme')==='dark'?'dark':'light'}catch{return 'light'}});
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;try{localStorage.setItem('vyapartrust-theme',theme)}catch{}},[theme]);
 return <ThemeContext.Provider value={{theme,setTheme}}>{children}</ThemeContext.Provider>
}
export const useTheme=()=>useContext(ThemeContext);
export function ThemeSwitch(){
 const {theme,setTheme}=useTheme();const {language}=useLanguage();
 const title=language==='hi'?'रंग बदलें':language==='bn'?'রঙ বদলান':'Change colours';
 return <button className="desi-theme-toggle" type="button" aria-label={title+': '+(theme==='light'?'night':'day')} title={title} onClick={()=>setTheme(theme==='light'?'dark':'light')}>
 <span className="material-symbols-outlined" aria-hidden="true">{theme==='light'?'dark_mode':'light_mode'}</span><span>{theme==='light'?(language==='hi'?'रात':'Night'):(language==='hi'?'दिन':'Day')}</span></button>
}
