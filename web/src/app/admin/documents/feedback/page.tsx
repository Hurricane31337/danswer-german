"use client";

import { LoadingAnimation } from "@/components/Loading";
import { ThumbsUpIcon } from "@/components/icons/icons";
import { useMostReactedToDocuments } from "@/lib/hooks";
import { DocumentFeedbackTable } from "./DocumentFeedbackTable";
import { numPages, numToDisplay } from "./constants";
import { AdminPageTitle } from "@/components/admin/Title";
import { Title } from "@tremor/react";

const Main = () => {
  const {
    data: mostLikedDocuments,
    isLoading: isMostLikedDocumentsLoading,
    error: mostLikedDocumentsError,
    refreshDocs: refreshMostLikedDocuments,
  } = useMostReactedToDocuments(false, numToDisplay * numPages);

  const {
    data: mostDislikedDocuments,
    isLoading: isMostLikedDocumentLoading,
    error: mostDislikedDocumentsError,
    refreshDocs: refreshMostDislikedDocuments,
  } = useMostReactedToDocuments(true, numToDisplay * numPages);

  const refresh = () => {
    refreshMostLikedDocuments();
    refreshMostDislikedDocuments();
  };

  if (isMostLikedDocumentsLoading || isMostLikedDocumentLoading) {
    return <LoadingAnimation text="Lade" />;
  }

  if (
    mostLikedDocumentsError ||
    mostDislikedDocumentsError ||
    !mostLikedDocuments ||
    !mostDislikedDocuments
  ) {
    return (
      <div className="text-red-600">
        Fehler beim Laden der Dokumente –{" "}
        {mostDislikedDocumentsError || mostLikedDocumentsError}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <Title className="mb-2">Dokumente mit meisten Likes</Title>
      <DocumentFeedbackTable documents={mostLikedDocuments} refresh={refresh} />

      <Title className="mb-2 mt-6">Dokumente mit meisten Dislikes</Title>
      <DocumentFeedbackTable
        documents={mostDislikedDocuments}
        refresh={refresh}
      />
    </div>
  );
};

const Page = () => {
  return (
    <div className="container mx-auto">
      <AdminPageTitle
        icon={<ThumbsUpIcon size={32} />}
        title="Dokument-Feedback"
      />

      <Main />
    </div>
  );
};

export default Page;
