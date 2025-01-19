
import { useEffect } from 'react';
import { supabase } from '../components/lib/supabase'

const LogOut = () => {
    useEffect(() => {
        const signOut = async () => {
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('Error signing out:', error)
            }
        }
        signOut()
    }, [])

    return (
        <div>
            Logging out...
        </div>
    )
}


export default LogOut
