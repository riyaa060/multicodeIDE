import React, { useEffect, useState } from 'react'; // Import necessary React hooks
import Navbar from "../components/Navbar"; // Import Navbar component
import Select from 'react-select'; // Import react-select for language selection
import { api_base_url } from '../helper'; // Import API base URL from helper
import { useNavigate } from 'react-router-dom'; // For navigation
import { toast } from 'react-toastify'; // For showing toast messages

const Home = () => {
  // State hooks for managing various states
  const [isCreateModelShow, setIsCreateModelShow] = useState(false); // Show/Hide create project modal
  const [languageOptions, setLanguageOptions] = useState([]); // Store language options for selection
  const [selectedLanguage, setSelectedLanguage] = useState(null); // Store selected language
  const [isEditModelShow, setIsEditModelShow] = useState(false); // Show/Hide edit project modal
  const [name, setName] = useState(""); // Store project name for creating/updating
  const [projects, setProjects] = useState(null); // Store fetched projects
  const [editProjId, setEditProjId] = useState(""); // Store project ID for editing

  const navigate = useNavigate(); // Hook to navigate between pages

  // Custom styles for react-select dropdown
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#000',
      borderColor: '#555',
      color: '#fff',
      padding: '5px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#000',
      color: '#fff',
      width: "100%",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#333' : '#000',
      color: '#fff',
      cursor: 'pointer',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#aaa',
    }),
  };

  // Function to fetch supported languages and filter required ones
  const getRunTimes = async () => {
    let res = await fetch("https://emkc.org/api/v2/piston/runtimes");
    let data = await res.json();

    // Filter only the required languages
    const filteredLanguages = [
      "python", "javascript", "c", "c++", "java", "bash"
    ];

    const options = data
      .filter(runtime => filteredLanguages.includes(runtime.language))
      .map(runtime => ({
        label: `${runtime.language} (${runtime.version})`,
        value: runtime.language === "c++" ? "cpp" : runtime.language,
        version: runtime.version,
      }));

    setLanguageOptions(options); // Set the available language options
  };

  // Function to handle language selection
  const handleLanguageChange = (selectedOption) => {
    setSelectedLanguage(selectedOption); // Update selected language state
    console.log("Selected language:", selectedOption);
  };

  // Function to fetch all projects for the user
  const getProjects = async () => {
    fetch(api_base_url + "/getProjects", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: localStorage.getItem("token") })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setProjects(data.projects); // Set projects state with fetched data
      } else {
        toast.error(data.msg); // Show error toast if the request fails
      }
    });
  };

  // useEffect hook to fetch projects and runtimes when the component mounts
  useEffect(() => {
    getProjects();
    getRunTimes();
  }, []); // Empty dependency array means this runs only once when component is mounted

  // Function to create a new project
  const createProj = () => {
    fetch(api_base_url + "/createProj", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        projLanguage: selectedLanguage.value,
        token: localStorage.getItem("token"),
        version: selectedLanguage.version
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setName(""); // Clear the name input after successful creation
        navigate("/editor/" + data.projectId); // Redirect to the project editor page
      } else {
        toast.error(data.msg); // Show error toast if creation fails
      }
    });
  };

  // Function to delete a project
  const deleteProject = (id) => {
    let conf = confirm("Are you sure you want to delete this project?");
    if (conf) {
      fetch(api_base_url + "/deleteProject", {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          token: localStorage.getItem("token")
        })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          getProjects(); // Refresh the project list after deletion
        } else {
          toast.error(data.msg); // Show error toast if deletion fails
        }
      });
    }
  };

  // Function to update an existing project
  const updateProj = () => {
    fetch(api_base_url + "/editProject", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: editProjId,
        token: localStorage.getItem("token"),
        name: name,
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setIsEditModelShow(false); // Close the edit modal
        setName(""); // Clear the name input
        setEditProjId(""); // Reset the project ID
        getProjects(); // Refresh the project list
      } else {
        toast.error(data.msg); // Show error toast if update fails
        setIsEditModelShow(false);
        setName("");
        setEditProjId("");
        getProjects();
      }
    });
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center px-[100px] justify-between mt-5">
        <h3 className='text-2xl'>👋 Hi, Riya</h3>
        <div className="flex items-center">
          <button onClick={() => { setIsCreateModelShow(true) }} className="btnNormal bg-blue-500 transition-all hover:bg-blue-600">Create Project</button>
        </div>
      </div>

      <div className="projects px-[100px] mt-5 pb-10">
        {
          projects && projects.length > 0 ? projects.map((project, index) => {
            return (
              <div className="project w-full p-[15px] flex items-center justify-between bg-[#0f0e0e]" key={index}>
                {/* Display project details and handle edit/delete actions */}
                <div onClick={() => { navigate("/editor/" + project._id) }} className='flex w-full items-center gap-[15px]'>
                  {
                    project.projLanguage === "python" ? <img className='w-[130px] h-[100px] object-cover' src="python_logo_url" alt="" />
                      : project.projLanguage === "javascript" ? <img className='w-[130px] h-[100px] object-cover' src="javascript_logo_url" alt="" />
                        : project.projLanguage === "cpp" ? <img className='w-[130px] h-[100px] object-cover' src="cpp_logo_url" alt="" />
                          : project.projLanguage === "c" ? <img className='w-[130px] h-[100px] object-cover' src="c_logo_url" alt="" />
                            : project.projLanguage === "java" ? <img className='w-[130px] h-[100px] object-cover' src="java_logo_url" alt="" />
                              : project.projLanguage === "bash" ? <img className='w-[130px] h-[100px] object-cover' src="bash_logo_url" alt="" />
                                : ""
                  }
                  <div>
                    <h3 className='text-xl'>{project.name}</h3>
                    <p className='text-[14px] text-[gray]'>{new Date(project.date).toDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-[15px]">
                  {/* Edit and Delete buttons */}
                  <button className="btnNormal bg-blue-500 transition-all hover:bg-blue-600" onClick={() => {
                    setIsEditModelShow(true);
                    setEditProjId(project._id);
                    setName(project.name);
                  }}>Edit</button>
                  <button onClick={() => { deleteProject(project._id) }} className="btnNormal bg-red-500 transition-all hover:bg-red-600">Delete</button>
                </div>
              </div>
            )
          }) : "No Project Found !"
        }
      </div>

      {/* Modal for creating new project */}
      {
        isCreateModelShow && // Check if the "Create Project" modal should be displayed
        <div onClick={(e) => {
          if (e.target.classList.contains("modelCon")) {
            setIsCreateModelShow(false);
            setName("");
          }
        }} className='modelCon flex flex-col items-center justify-center w-screen h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.5)]'>
          <div className="modelBox flex flex-col items-start rounded-xl p-[20px] w-[25vw] h-[auto] bg-[#0F0E0E]">
            <h3 className='text-xl font-bold text-center'>Create Project</h3>
            <div className="inputBox">
              <input onChange={(e) => { setName(e.target.value) }} value={name} type="text" placeholder='Enter your project name' className="text-black" />
            </div>
            <Select
              placeholder="Select a Language"
              options={languageOptions}
              styles={customStyles}
              onChange={handleLanguageChange} // Handle language selection
            />
            {selectedLanguage && (
              <>
                <p className="text-[14px] text-green-500 mt-2">
                  Selected Language: {selectedLanguage.label}
                </p>
                <button onClick={createProj} className="btnNormal bg-blue-500 transition-all hover:bg-blue-600 mt-2">Create</button>
              </>
            )}
          </div>
        </div>
      }

      {/* Modal for editing an existing project */}
      {
        isEditModelShow && // Check if the "Create Project" modal should be displayed
        <div onClick={(e) => {
  // Check if the click happened outside the modal content (on the backdrop)

          if (e.target.classList.contains("modelCon")) {
            setIsEditModelShow(false);
            setName("");
          }
        }} className='modelCon flex flex-col items-center justify-center w-screen h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.5)]'>
          <div className="modelBox flex flex-col items-start rounded-xl p-[20px] w-[25vw] h-[auto] bg-[#0F0E0E]">
            <h3 className='text-xl font-bold text-center'>Update Project</h3>
            <div className="inputBox">
              <input onChange={(e) => { setName(e.target.value) }} value={name} type="text" placeholder='Enter your project name' className="text-black" />
            </div>

            <button onClick={updateProj} className="btnNormal bg-blue-500 transition-all hover:bg-blue-600 mt-2">Update</button>
          </div>
        </div>
      }
    </>
  );
};

export default Home;
