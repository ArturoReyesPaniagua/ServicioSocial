// src/components/Expedientes/ExpedienteView.jsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ExpedientePDFManager from './ExpedientePDFManager';

const ExpedienteView = ({ expediente, onClose, onEdit }) => {
  // Función auxiliar para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  // Función para determinar el color de estado
  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Concluido':
        return 'bg-green-100 text-green-800';
      case 'En proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar si hay fecha límite vencida
  const isOverdue = () => {
    if (!expediente.fechaLimite) return false;
    const limitDate = new Date(expediente.fechaLimite);
    const today = new Date();
    return limitDate < today;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Detalles del Expediente</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Número de Expediente:</span>
                  <p className="text-base">{expediente.NoExpediente}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Folio de Seguimiento:</span>
                  <p className="text-base">{expediente.noFolioDeSeguimiento}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Estado:</span>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(expediente.nombreEstado)}`}>
                      {expediente.nombreEstado}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Fecha de Recepción:</span>
                  <p className="text-base">{formatDate(expediente.fechaDeRecepcion)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Fecha Límite:</span>
                  <p className={`text-base ${isOverdue() ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(expediente.fechaLimite)}
                    {isOverdue() && <span className="ml-2 text-red-600 text-xs">(Vencida)</span>}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Solicitante:</span>
                  <p className="text-base">{expediente.solicitante}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Responsable:</span>
                  <p className="text-base">{expediente.responsable}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Fecha de Respuesta:</span>
                  <p className="text-base">{formatDate(expediente.fechaDeRespuesta)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">Asunto:</span>
              <p className="text-base mt-1">{expediente.asunto}</p>
            </div>

            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">Observaciones:</span>
              <p className="text-base mt-1 whitespace-pre-line">
                {expediente.observaciones || 'Sin observaciones.'}
              </p>
            </div>

            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">Estado de Archivo:</span>
              <p className="text-base mt-1">
                {expediente.archivado 
                  ? 'Expediente archivado' 
                  : 'Expediente activo'}
              </p>
            </div>
          </div>

          {/* Gestor de PDFs del expediente */}
          <ExpedientePDFManager expedienteId={expediente.idExpediente} />

          <div className="flex justify-end mt-6">
            <button
              onClick={onEdit}
              className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Expediente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpedienteView;