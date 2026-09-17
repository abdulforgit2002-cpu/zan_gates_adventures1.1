import AdminTaxonomy from "./AdminTaxonomy";

function AdminDestinations() {
    return (
        <AdminTaxonomy
            resource="destinations"
            title="Destinations"
            singularLabel="Destination"
        />
    );
}

export default AdminDestinations;
