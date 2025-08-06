import axios from "axios";
import { useState } from "react"

export const ModbusTagsList=()=>{
    const [tags,setTags]=useState([]);
    const [editingId,setEditingId]=useState(null);
    const [searchBar,setSearchBar]=useState();
    const [editConfig,setEditConfig]=useState({
        name:"",
        scaling:""
    });

    const updateEditConfig=(id,name,value)=>{
        setEditConfig((prev)=>({
            ...prev,[name]:value
        }))
    }

    const handleEdit=(id)=>{
        setEditingId(id)
    }

    const handleDelete=async (id)=>{
        try{
            const response=await axios.delete(``,{id:id});
        }catch(e){
            console.log(e);
        }
    }


    const handleSaveEdit=async (updateId)=>{
        try{
            const response= await axios.post(``,editConfig);
            
        }catch(e){
            console.log(e);
        }
    }

    const handleCancelEdit=()=>{
        setEditConfig({
            name:"",
            scaling:""
        })
        setEditingId(null)
    }

    const getTags=async()=>{
        try{
            const response=await axios.get(``);
            setTags(response.data);
        }catch(e){
            console.log(e);
        }
    }



    return (
        <div>
            <div>
                 <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tag Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Scaling
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tags.map(tag => (
                                    <tr
                                        key={tag.id}
                                        className={`hover:bg-gray-50 cursor-pointer `}
                                    >{
                                        editingId===tag.id ?
                                        (<td>
                                            <input type="text"
                                            className="text-sm font-medium text-gray-900" 
                                            onChange={(e)=>updateEditConfig(tag.id,'name',e.target.value)}/>
                                        </td>) :
                                        (

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                                        </td>
                                        )
                                    }
                                        {/* <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {submission.status}
                                            </span>
                                        </td> */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tag.address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tag.createdAt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            
                                        </td>
                                        {
                                        editingId===tag.id ?
                                        (<td>
                                            <input type="text"
                                            className="text-sm font-medium text-gray-900" 
                                            onChange={(e)=>updateEditConfig(tag.id,'scaling',e.target.value)}/>
                                        </td>) :
                                        (

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{tag.scaling}</div>
                                        </td>
                                        )
                                    }
                                    {
                                        editingId===tag.id ?
                                        (
                                            <div>
                                                <button
                                                  onClick={() => handleSaveEdit(tag.id)}
                                                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                                                >
                                                  Save
                                                </button>
                                                <button
                                                  onClick={handleCancelEdit}
                                                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                                                >
                                                  Cancel
                                                </button>
                                            </div>
                                        ) :
                                        (
                                            <div>   
                                                <button
                                                  onClick={() => {handleEdit(tag.id)
                                                    setEditConfig(server)
                                                  }}
                                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                  title="Edit server"
                                                >
                                                  <Edit className="w-4 h-4" />
                                                </button> 
                                                <button
                                                  onClick={() => {handleDelete(tag.id)

                                                  }}
                                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                  title="Delete server"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )
                                    }
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
            </div>
        </div>
    )
}