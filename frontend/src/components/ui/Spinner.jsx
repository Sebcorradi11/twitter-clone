export default function Spinner() {
    return (
        <div className="flex justify-center items-center py-8">
            <div
                className="w-6 h-6 rounded-full animate-spin"
                style={{ border: '2px solid var(--border)', borderTopColor: '#1d9bf0' }}
            />
        </div>
    )
}
