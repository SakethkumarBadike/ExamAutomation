import { useEffect } from "react"

export const useOnRefresh=(showWarn=true)=>{
    useEffect(()=>{
        if(!showWarn)return;
        const handleBeforeUnload=(event)=>{
           event.preventDefault();
           event.returnValue=' ';//browsers will not consider this as a valid message (because malicious scripts used to use this), but it will show a warning dialog
        }

        window.addEventListener("beforeunload",handleBeforeUnload)

       return ()=>{
            window.removeEventListener("beforeunload",handleBeforeUnload)
       }
    },[showWarn])
}
