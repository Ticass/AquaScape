import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardHeader,
  Editable,
  CardBody,
  CardFooter,
  Image,
  Text,
  Box,
  Flex,
  Avatar,
  Heading,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  EditableInput,
  EditableTextarea,
  EditablePreview,
} from "@chakra-ui/react";
import { BiLike, BiShare, BiChat } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import UserContext from "../../contexts/user/UserContext";
import axios from "axios";
import CommentsList from "../comments/commentsList";
import urls from "../../constants/urls";
import { Link } from "react-router-dom";
// Tweet Component
const Post = ({ photo, first_name, content, contentPhoto, userId, waveId }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const { getProfilePicture, getCurrentUser } = useContext(UserContext);
  const [likes, setLikes] = useState(0);
  const [displayedLikes, setDisplayedLikes] = useState(likes);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [currentUser, setCurrentUser] = useState({})

  useEffect(() => {
    const fetchProfilePicture = () => {
      getProfilePicture(userId).then((response) => {
        setProfilePicture(response);
      });
    };

    const fetchLikes = () => {
      axios
        .get(`${urls.apiNgrok}/waves/likes`, { params: { wave_id: waveId } })
        .then((response) => {
          setLikes(response.data.count);
        });
    };

    getCurrentUser().then((user) => setCurrentUser(user))

    fetchProfilePicture();
    fetchLikes();
  }, [getProfilePicture, userId, waveId, getCurrentUser]);

  const startEdit = () => {
    if (!currentUser) return;
    if (userId !== currentUser.id) return;
    setEditMode(true);
  };

  const submitEdit = (nextValue) => {
    axios.post(`${urls.apiNgrok}/wave/edit`, false, {
      withCredentials: true,
      params: { wave_id: waveId, user_id: userId, content: nextValue },
    })
    .then(() => {
      setEditMode(false);
      setEditedContent(nextValue);
    });
  };

  const onLike = () => {
    axios
      .post(`${urls.apiNgrok}/wave/like`, false, {
        withCredentials: true,
        params: { wave_id: waveId },
      })
      .then((response) => {
        setLikes(response.data.count);
      });
  };

  const deletePost = () => {
    axios.post(`${urls.apiNgrok}/wave/delete`, false, {
      withCredentials: true,
      params: { wave_id: waveId, user_id: userId },
    });
  };

  useEffect(() => {
    setDisplayedLikes(likes);
  }, [likes]);

  return (
    <Box w="full" p={3} borderWidth="1px" borderRadius="md">
      <Card maxW="600px" m="0 auto">
        {" "}
        {/* Ensure card width matches NewPost */}
        <CardHeader>
          <Flex justify="space-between" alignItems="center">
            <Flex alignItems="center" spacing={4}>
              <Avatar name={first_name} src={profilePicture || photo} />
              <Box p={3}>
                <Link to={`/profile/${userId}`}>
                  <Heading size="sm">@{first_name}</Heading>
                </Link>
              </Box>
            </Flex>
            {
                userId === currentUser?.id && (<Menu>
                  <MenuButton
                    as={IconButton}
                    variant="ghost"
                    colorScheme="gray"
                    aria-label="Options"
                    icon={<BsThreeDotsVertical />}
                  />
                  <MenuList>
                  <MenuItem onClick={startEdit}>Edit Post</MenuItem>
                  <MenuItem onClick={deletePost}>Delete Post</MenuItem>
                  </MenuList>
                </Menu>)
              }
          </Flex>
        </CardHeader>
        <CardBody>
          {
            userId === currentUser?.id ? (    <Editable
              defaultValue={editedContent}
              isEditing={editMode}
              onSubmit={submitEdit}
              onCancel={() => setEditMode(false)}
              color='black'
            >
              <EditablePreview />
              <EditableTextarea color="black"></EditableTextarea>
              </Editable>) : (<Text>{content}</Text>)
          }
        </CardBody>
        {contentPhoto && (
          <Image objectFit="cover" src={contentPhoto} alt="Chakra UI" />
        )}
        <CardFooter
          justify="space-between"
          flexWrap="wrap"
          sx={{
            "& > button": {
              minW: "136px",
            },
          }}
        >
          <Button
            flex="1"
            variant="ghost"
            onClick={onLike}
            leftIcon={<BiLike />}
          >
            Like {displayedLikes}
          </Button>
          <Button flex="1" variant="ghost" leftIcon={<BiChat />}>
            Comment
          </Button>
          <Button flex="1" variant="ghost" leftIcon={<BiShare />}>
            Share
          </Button>
          <CommentsList waveId={waveId}></CommentsList>
        </CardFooter>
      </Card>
    </Box>
  );
};

export default Post;
