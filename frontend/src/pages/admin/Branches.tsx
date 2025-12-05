import { useAdminBranches } from '../../hooks/useAdminBranches';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Modal from '../../components/ui/Modal';

export default function Branches() {
  const {
    filteredBranches,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    openBranchModal,
    closeModal,
    currentBranch,
    formErrors,
    isSubmitting,
    handleInputChange,
    handleSaveBranch,
    toggleBranchStatus,
    confirmDeleteBranch,
    isDeleteConfirmOpen,
    handleDeleteBranch,
    isDeletingBranch
  } = useAdminBranches();

  const columns = [
    {
      header: 'Nombre',
      accessor: (branch: any) => (
        <div className="flex items-center">
          <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">{branch.name}</span>
        </div>
      )
    },
    {
      header: 'Código',
      accessor: (branch: any) => (
        <span className="text-gray-600 font-mono">{branch.code}</span>
      )
    },
    {
      header: 'Dirección',
      accessor: (branch: any) => branch.address || '-'
    },
    {
      header: 'Teléfono',
      accessor: (branch: any) => branch.phone || '-'
    },
    {
      header: 'Vendedores',
      accessor: (branch: any) => (
        <span className="text-gray-800 font-medium">{branch.seller_count || 0}</span>
      ),
      className: 'text-center'
    },
    {
      header: 'Productos',
      accessor: (branch: any) => (
        <span className="text-gray-800 font-medium">{branch.product_count || 0}</span>
      ),
      className: 'text-center'
    },
    {
      header: 'Estado',
      accessor: (branch: any) => (
        <button
          onClick={() => toggleBranchStatus(branch.id, branch.active)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            branch.active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {branch.active ? 'Activa' : 'Inactiva'}
        </button>
      ),
      className: 'text-center'
    },
    {
      header: 'Acciones',
      accessor: (branch: any) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openBranchModal(branch)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => confirmDeleteBranch(branch.id)}
            icon={<TrashIcon className="h-4 w-4" />}
            className="text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200"
          >
            Eliminar
          </Button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-gray-800">Gestión de Sucursales</h2>
          <p className="text-gray-600">Administra las sucursales de tu organización</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => openBranchModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nueva Sucursal
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando sucursales...</div>
        ) : filteredBranches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No se encontraron sucursales' : 'No hay sucursales registradas'}
          </div>
        ) : (
          <Table columns={columns} data={filteredBranches} keyExtractor={(branch) => branch.id} />
        )}
      </Card>

      {/* Modal de crear/editar sucursal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentBranch?.id ? 'Editar Sucursal' : 'Nueva Sucursal'}
      >
        <form onSubmit={handleSaveBranch} className="space-y-4">
          <FormField
            label="Nombre"
            value={currentBranch?.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={formErrors.name}
            placeholder="Ej: Sucursal Centro"
            required
          />

          <FormField
            label="Código"
            value={currentBranch?.code || ''}
            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
            error={formErrors.code}
            placeholder="Ej: CENTRO"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              value={currentBranch?.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ej: Calle Principal #123"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <FormField
            label="Teléfono"
            value={currentBranch?.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Ej: 555-1234"
          />

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="active"
              checked={currentBranch?.active ?? true}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Sucursal activa
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => !isDeletingBranch && closeModal()}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar esta sucursal? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                closeModal();
              }}
              disabled={isDeletingBranch}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteBranch}
              disabled={isDeletingBranch}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingBranch ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
