import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { uploadToIpfs } from "../../../utils/minter";


/**
 * This file will contain the AddNfts component, which we will use to mint a new NFT. When the user clicks the Add button, we will display a modal with a form for the metadata of the NFT.
 */


/**
 * Then we create two arrays, one for the COLORS and one for the SHAPES, with some values that we will use as attributes for the NFT.
 */
const COLORS = ["Red", "Green", "Blue", "Cyan", "Yellow", "Purple"];
const SHAPES = ["Circle", "Square", "Triangle"];

const AddNfts = ({ save, address }) => {

    const [name, setName] = useState("");
    const [ipfsImage, setIpfsImage] = useState("");
    const [description, setDescription] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [show, setShow] = useState(false);

    // check if all form data has been filled
    const isFormFilled = () =>
        name && ipfsImage && description && attributes.length > 2;

    // close the popup modal
    const handleClose = () => {
        setShow(false);
        setAttributes([]);
    };

    // display the popup modal
    const handleShow = () => setShow(true);

    // add an attribute to an NFT
    const setAttributesFunc = (e, trait_type) => {
        const { value } = e.target;
        const attributeObject = {
            trait_type,
            value,
        };
        const arr = attributes;

        // check if attribute already exists
        const index = arr.findIndex((el) => el.trait_type === trait_type);

        if (index >= 0) {
            // update the existing attribute
            arr[index] = {
                trait_type,
                value,
            };
            setAttributes(arr);
            return;
        }

        // add a new attribute
        setAttributes((oldArray) => [...oldArray, attributeObject]);
    };

    /**
     * We create a function that checks if all the form data has been filled and two functions that we use to open (handleShow) and close (handleClose) the popup modal.
     * We also need a function (setAttributesFunc) that handles the functionality to add attributes to the NFT.
     */

    return (
        <>
            <Button
                onClick={handleShow}
                variant="dark"
                className="rounded-pill px-0"
                style={{ width: "38px" }}
            >
                <i className="bi bi-plus"></i>
            </Button>

            {/* Modal */}
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create NFT</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <FloatingLabel
                            controlId="inputLocation"
                            label="Name"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Name of NFT"
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                            />
                        </FloatingLabel>

                        <FloatingLabel
                            controlId="inputDescription"
                            label="Description"
                            className="mb-3"
                        >
                            <Form.Control
                                as="textarea"
                                placeholder="description"
                                style={{ height: "80px" }}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                }}
                            />
                        </FloatingLabel>

                        <Form.Control
                            type="file"
                            className={"mb-3"}
                            onChange={async (e) => {
                                const imageUrl = await uploadToIpfs(e);
                                if (!imageUrl) {
                                    alert("failed to upload image");
                                    return;
                                }
                                setIpfsImage(imageUrl);
                            }}
                            placeholder="Product name"
                        ></Form.Control>
                        <Form.Label>
                            <h5>Properties</h5>
                        </Form.Label>
                        <Form.Control
                            as="select"
                            className={"mb-3"}
                            onChange={async (e) => {
                                setAttributesFunc(e, "background");
                            }}
                            placeholder="Background"
                        >
                            <option hidden>Background</option>
                            {COLORS.map((color) => (
                                <option
                                    key={`background-${color.toLowerCase()}`}
                                    value={color.toLowerCase()}
                                >
                                    {color}
                                </option>
                            ))}
                        </Form.Control>

                        <Form.Control
                            as="select"
                            className={"mb-3"}
                            onChange={async (e) => {
                                setAttributesFunc(e, "color");
                            }}
                            placeholder="NFT Color"
                        >
                            <option hidden>Color</option>
                            {COLORS.map((color) => (
                                <option
                                    key={`color-${color.toLowerCase()}`}
                                    value={color.toLowerCase()}
                                >
                                    {color}
                                </option>
                            ))}
                        </Form.Control>

                        <Form.Control
                            as="select"
                            className={"mb-3"}
                            onChange={async (e) => {
                                setAttributesFunc(e, "shape");
                            }}
                            placeholder="NFT Shape"
                        >
                            <option hidden>Shape</option>
                            {SHAPES.map((shape) => (
                                <option
                                    key={`shape-${shape.toLowerCase()}`}
                                    value={shape.toLowerCase()}
                                >
                                    {shape}
                                </option>
                            ))}
                        </Form.Control>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button
                        variant="dark"
                        disabled={!isFormFilled()}
                        onClick={() => {
                            save({
                                name,
                                ipfsImage,
                                description,
                                ownerAddress: address,
                                attributes,
                            });
                            handleClose();
                        }}
                    >
                        Create NFT
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

AddNfts.propTypes = {
    save: PropTypes.func.isRequired,
    address: PropTypes.string.isRequired,
};

export default AddNfts;

