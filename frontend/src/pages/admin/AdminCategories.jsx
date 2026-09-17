import AdminTaxonomy from "./AdminTaxonomy";

function AdminCategories() {
    return (
        <AdminTaxonomy
            resource="categories"
            title="Categories"
            singularLabel="Category"
        />
    );
}

export default AdminCategories;
