import { Helmet } from "react-helmet";
import SubstituteAnalysis from "../../components/analysis/SubstituteAnalysis";

const SubstituteAnalysisPage = () => {
  return (
    <section className="px-2 sm:px-4 py-4">
      <Helmet>
        <title>Substitute Analysis - Metro HR</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <SubstituteAnalysis />
      </div>
    </section>
  );
};

export default SubstituteAnalysisPage;
