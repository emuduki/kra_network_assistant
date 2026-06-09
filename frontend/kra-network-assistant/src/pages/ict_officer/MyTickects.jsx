import { PageHeader } from "../../components/index.jsx";

export default function MyTickects() {
    return (
        <div className="fadeIn">
            <PageHeader title="My Tickets" breadcrumb="My Tickets"/>
            <p style={{ color: '#6B7C72', fontSize: 13}}>
                Phase 3 - connect to live API. Scaffold in place.
            </p>
        </div>
    );
}