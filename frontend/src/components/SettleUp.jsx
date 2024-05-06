import React, { useRef } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import styled from "styled-components";
const SettleUp = ({ show, handleClose, data }) => {
  
  return (
    <>
      {show && (
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <StyledModalTitle>{`QR Code for `}</StyledModalTitle>
          </Modal.Header>
          <Modal.Body >
            <Container>
              <Row className="justify-content-center">
                <Col xs={6}>
                  <div className="text-center">
                    <QRCode
                      size={256}
                      style={{
                        height: "200px",
                        maxWidth: "200px",
                        width: "200px",
                      }}
                      value={exhibitUrl}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Container>
              <Row className="justify-content-center">
                <Col xs={6}>
                  {/* Your centered element goes here */}
                  <div className="text-center">
                    <button
                      className="btn-primary btn-primary-md"
                      onClick={downloadQR}
                    >
                      Download
                    </button>
                  </div>
                </Col>
              </Row>
            </Container>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
const StyledModalTitle = styled(Modal.Title)`
  font-size: 18px;
  font-family: "Poppins";
`;

export default CustomModal;