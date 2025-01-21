import React from "react";
import { useParams } from "react-router-dom";

const WorkspaceDetails = () => {
  const { workspaceName } = useParams();

  return (
    <div>
      <h1>Welcome to {workspaceName}</h1>
    </div>
  );
};

export default WorkspaceDetails;
