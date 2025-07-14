import '../App.css';
import { Accordion, Col, Row, Button } from 'react-bootstrap';
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
        receive an analysis report of the plan's strengths and weaknesses. This AI tool will review the plan using the
        <a href="https://osf.io/mgjpp">NSF DART Data Management Plan Rubric</a> and provide feedback for each criteria in the NSF guidelines.
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

        <Button variant="primary" href={'/submit-text'}>
          Submit your DMSP for Analysis
        </Button>
      </div>

      <hr />

      <h3 className="mt-2">Frequently Asked Questions</h3>

      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Will this DMSP AI Tool use my data to train the AI model further?</Accordion.Header>
          <Accordion.Body>
          No. This application doesn’t use or save your plan to train the model. The AI-generated response is based
          on the National Science Foundation’s DART Data Management Plan Rubric to gauge your plan’s effectiveness.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Can I use this AI feedback tool for my study if my funding doesn’t come from NSF?</Accordion.Header>
          <Accordion.Body>
          Although this DMSP AI Feedback Tool is currently configured to review plans using the NSF guidelines,
              there are plans to add support for additional funding agencies in the near future. As those agencies are
              added to this tool, this page will be updated to reflect the available agencies’ guidelines. In the
              meantime, if you use this tool for an unsupported agency, your plan will be evaluated against the NSF
              criteria, and the evaluation may not be accurate for your funding agency’s criteria.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Which model is used in the ASU DMSP AI Tool?</Accordion.Header>
          <Accordion.Body>
          The ASU DMSP AI Feedback Tool uses the Gemini 2 Flash hosted in{' '}
              <a href="https://ai.asu.edu">ASU’s CreateAI platform</a>.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>How do I get my DMSP into the Response Agent?</Accordion.Header>
          <Accordion.Body>
          There are two ways to get your plan into the ASU DMSP AI Feedback Tool. From the landing page, you can
              paste in the entire text from the plan OR if the DMSP in the DMPTool has been made public, the assigned
              DMP ID can be entered and the AI Feedback Tool will retrieve your DMP from the DMPTool.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4">
          <Accordion.Header>Who can see my plan?</Accordion.Header>
          <Accordion.Body>
          Staff in the Research Technology Office and ASU Library Researcher Support.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="5">
          <Accordion.Header>What happens to my plan after I get my feedback?</Accordion.Header>
          <Accordion.Body>
          Any suggestions made by the AI Feedback Tool would need to be manually incorporated into your data
              management and sharing plan by the authors before submitting to your funding agency. After providing
              feedback, the ASU AI Feedback Tool will retain your DMSP for administrative support purposes only.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="6">
          <Accordion.Header>Can I trust the AI Response Agent to give me correct feedback?</Accordion.Header>
          <Accordion.Body>
          This AI Feedback Tool is trained to give correct feedback based on the{' '}
              <a href="https://osf.io/mgjpp">NSF DART Data Management Plan Rubric</a>. It cannot provide other feedback
              at this time.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="7">
          <Accordion.Header>Can I use this AI feedback tool for my study if my funding doesn’t come from NSF?</Accordion.Header>
          <Accordion.Body>
          Although this DMSP AI Feedback Tool is currently configured to review plans using the NSF guidelines,
              there are plans to add support for additional funding agencies in the near future. As those agencies are
              added to this tool, this page will be updated to reflect the available agencies’ guidelines. In the
              meantime, if you use this tool for an unsupported agency, your plan will be evaluated against the NSF
              criteria, and the evaluation may not be accurate for your funding agency’s criteria.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Col>
  </Row>
);
