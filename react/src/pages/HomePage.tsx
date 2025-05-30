import '../App.css';
import { Col, Row, Button } from 'react-bootstrap';
// import { NavLink } from "react-router";
import 'github-markdown-css/github-markdown-light.css';

export const HomePage = () => (
  <Row className="mb-4">
    <Col md={8}>
      <h2 className="mt-2">Welcome to the ASU Data Management and Sharing Plan (DMSP) AI Tool Beta!</h2>

      <p className="mt-2">
        The ASU DMSP AI Tool was developed in partnership with the Association of Research Libraries and the California
        Digital Library, which is responsible for the development of the&nbsp;
        <a href="https://dmptool.org/" target="_blank" rel="noopener noreferrer">
          DMP Tool
        </a>
        . This assistant is intended to support the DMP Tool service and aid researchers in preparing their DMSPs.
      </p>

      <p className="mt-2">
        This beta test is a standalone tool for which ASU researchers may submit a draft or final copy of their DMSP and
        receive an analysis report of the plan's strengths and weaknesses. This AI toolwill review the plan using the
        NSF Dart rubric and provide feedback for each criteria in the NSF guidelines.
      </p>

      <p className="mt-2">
        This AI tool will not write a DMSP. It can only offer suggestions on how it might be improved. The tool is
        designed to help researchers identify areas of their DMSP that may need improvement or additional detail,
        ensuring compliance with NSF requirements.
      </p>
      <p className="mt-2">
        If you have been invited to test this beta tool, please understand this is a Work-in-Progress, and this AI tool
        may not be complete or accurate. Please document any issues or concerns you uncover while using this tool, and
        please provide feedback on how we might improve this tool.
      </p>

      <div className="mt-4">
        {/* <NavLink to="/submit-text" end>
        Submit your DMSP for Analysis
        </NavLink> */}

        <Button variant="primary" href={import.meta.env.PROD
            ? `https://dmsp.dev.rtd.asu.edu/submit-text`
            : `http://localhost:3000/submit-text`}>
          Submit your DMSP for Analysis
        </Button>
      </div>

      <hr />

      <h3 className="mt-2">Frequently Asked Questions</h3>

      <p className="mt-2">
        <strong>Will this DMSP AI Tool use my data to train the AI model further?</strong>
        <br />
        No. This application doesn’t use or save your plan to train the model. The AI-generated response is based on the
        National Science Foundation’s DART Data Management Plan Rubric to gauge your plan’s effectiveness.
      </p>
    </Col>
  </Row>
);
