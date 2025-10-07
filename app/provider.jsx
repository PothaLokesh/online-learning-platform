"use client"
import React from 'react';
import axios from 'axios';
import {useUser} from '@clerk/nextjs';
import { useState,useEffect } from 'react';
import { UserDetailContext } from '@/context/UserDetailContext';
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';

function Provider({children}) {
    const {user} = useUser();
    const [userDetail,setUserDetail]=useState();
    const  [selectedChapterIndex,setSelectedChapterIndex]=useState(0);
    useEffect(() => {
        if (user) {
            CreateNewUser();
        }
    }, [user]);
    
    const CreateNewUser = async () => {
        try {
            console.log("Attempting to create user with:", {
                name: user?.fullName,
                email: user?.primaryEmailAddress?.emailAddress
            });
            
            const result = await axios.post('/api/user', {
                name: user?.fullName,
                email: user?.primaryEmailAddress?.emailAddress
            });
            console.log("User created/found:", result.data);
            setUserDetail(result.data);
        } catch (error) {
            console.error("Error creating user:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
        }
    };

    return (
        <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
          <SelectedChapterIndexContext.Provider value={{selectedChapterIndex,setSelectedChapterIndex}}>
        <div>
            {children}
        </div>
        </SelectedChapterIndexContext.Provider>
        </UserDetailContext.Provider>
    );
}

export default Provider;
