import React from "react";
import { Helmet } from "react-helmet";

const DocumentType = () => {
  return (
    <>
      <Helmet>
        <title>Document Types - Metro HR</title>
      </Helmet>
      <section className="bg-gray-100 dark:bg-secondary p-4 rounded-lg min-h-screen shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Document Types</h2>
          <div>
            <button disabled className="bg-blue-500 text-white text-sm px-4 py-2 rounded-full opacity-60">Create</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">The Document Types admin UI is not implemented yet. Backend routes and seed data exist, so this page can be implemented following the Designations pattern. </p>
          <p className="mt-3 text-sm text-gray-500">Quick next step: add a table, search, pagination and a modal component at <code>client/src/components/shared/modals/DocumentTypeModal.jsx</code>.</p>
        </div>
      </section>
    </>
  );
};

export default DocumentType;
