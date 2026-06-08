import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'

export default function Layout() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            <div className="max-w-[1265px] mx-auto flex">
                <Sidebar />

                <main
                    className="flex-1 min-h-screen max-w-[600px] w-full pb-16 md:pb-0"
                    style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}
                >
                    <Outlet />
                </main>

                <div className="hidden xl:flex w-[350px] flex-shrink-0 px-4 py-2">
                    <RightPanel />
                </div>
            </div>
        </div>
    )
}
