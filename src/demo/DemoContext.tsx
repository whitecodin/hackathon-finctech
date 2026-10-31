import React,{createContext,useCallback,useContext,useState} from 'react';
const Context=createContext<{demoEnabled:boolean;enterDemo:()=>void;exitDemo:()=>void}>({demoEnabled:false,enterDemo:()=>{},exitDemo:()=>{}});
export function DemoProvider({children}:{children:React.ReactNode}){
 const [demoEnabled,setDemo]=useState(()=>{try{return sessionStorage.getItem('vyapartrust-demo')==='yes'}catch{return false}});
 const enterDemo=useCallback(()=>{setDemo(true);try{sessionStorage.setItem('vyapartrust-demo','yes')}catch{}},[]);
 const exitDemo=useCallback(()=>{setDemo(false);try{sessionStorage.removeItem('vyapartrust-demo')}catch{}},[]);
 return <Context.Provider value={{demoEnabled,enterDemo,exitDemo}}>{children}</Context.Provider>;
}
export const useDemo=()=>useContext(Context);
