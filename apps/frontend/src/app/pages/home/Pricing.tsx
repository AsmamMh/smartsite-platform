// PricingPage.jsx
export default function Pricing() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Tarification</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Plans adaptés à votre taille de chantier
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-4xl lg:grid-cols-3">
          {/* Starter */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
            <div>
              <h3 className="text-lg font-semibold leading-8 text-gray-900">Starter</h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">Pour petites entreprises et chantiers locaux</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">49 TND</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/mois</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li>1 chantier actif</li>
                <li>Suivi basique + mobile</li>
                <li>Rapports simples</li>
                <li>Support email</li>
              </ul>
            </div>
            <a href="#" className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
              Commencer essai gratuit
            </a>
          </div>

          {/* Pro - Recommended */}
          <div className="flex flex-col justify-between rounded-3xl bg-indigo-600 p-8 ring-1 ring-indigo-200 xl:p-10">
            <div>
              <h3 className="text-lg font-semibold leading-8 text-white">Pro</h3>
              <p className="mt-4 text-sm leading-6 text-indigo-100">Idéal pour entreprises moyennes</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-white">149 TND</span>
                <span className="text-sm font-semibold leading-6 text-indigo-100">/mois</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-indigo-100">
                <li>Chantiers illimités</li>
                <li>IA prédictive complète</li>
                <li>Alertes sécurité avancées</li>
                <li>Tableaux de bord personnalisés</li>
                <li>Support prioritaire</li>
              </ul>
            </div>
            <a href="#" className="mt-8 block rounded-md bg-white px-3.5 py-2 text-center text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50">
              Essayer 14 jours gratuit
            </a>
          </div>

          {/* Enterprise */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
            <div>
              <h3 className="text-lg font-semibold leading-8 text-gray-900">Enterprise</h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">Pour grandes entreprises et groupes</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">Sur devis</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li>Tout inclus + API</li>
                <li>Intégrations ERP</li>
                <li>Multi-sociétés</li>
                <li>Support dédié + formation</li>
              </ul>
            </div>
            <a href="#" className="mt-8 block rounded-md bg-gray-900 px-3.5 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
              Contacter l'équipe
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}