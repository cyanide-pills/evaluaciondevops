import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";

export const FormDespachoSimple = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    console.log("Nuevo despacho:", data);
    const jsonData = {
      fechaDespacho: data.fechaDespacho,
      patenteCamion: data.patenteCamion,
      intento: parseInt(data.intento) || 0,
      despachado: data.despachado === "true",
      idCompra: parseInt(data.idCompra),
      direccionCompra: data.direccionCompra,
      valorCompra: parseInt(data.valorCompra),
    };

    console.log("Datos del formulario:", jsonData);

    try {
      await axios.post("/api/v1/despachos", jsonData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      Swal.fire({
        title: "Despacho registrado 🛻!",
        text: "El despacho ha sido generado con éxito en la base de datos",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Hubo un error al crear el despacho",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
    onClose();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center text-center px-24 text-xl"
      >
        <div className="mx-auto text-3xl font-bold mb-10 text-teal-600">
          Crear Nuevo Despacho
        </div>

        <div className="mb-5">
          <label className="block font-bold mb-2">Fecha de despacho</label>
          <input
            type="date"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("fechaDespacho", { required: true })}
          />
        </div>

        <div className="mb-5">
          <label className="block font-bold mb-2">Patente de camión</label>
          <input
            type="text"
            placeholder="Ej: ABC-1234"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("patenteCamion", { required: true })}
          />
        </div>

        <div className="mb-5">
          <label className="block font-bold mb-2">ID Orden de compra</label>
          <input
            type="number"
            placeholder="ID de la compra"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("idCompra", { required: true })}
          />
        </div>

        <div className="mb-5">
          <label className="block font-bold mb-2">Dirección de entrega</label>
          <input
            type="text"
            placeholder="Ingresa dirección"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("direccionCompra", { required: true })}
          />
        </div>

        <div className="mb-5">
          <label className="block font-bold mb-2">Valor de compra</label>
          <input
            type="number"
            placeholder="Valor total"
            step="0.01"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("valorCompra", { required: true })}
          />
        </div>

        <div className="mb-5">
          <label className="block font-bold mb-2">Intentos de entrega</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            defaultValue="0"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("intento")}
          />
        </div>

        <div className="mb-5">
          <label className="block font-bold mb-2">¿Despachado?</label>
          <select
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("despachado")}
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-8 rounded-lg transition-all"
          >
            Crear Despacho
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-8 rounded-lg transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
};
